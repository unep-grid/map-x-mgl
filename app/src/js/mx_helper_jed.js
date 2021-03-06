/**
 * @param {Object} o options
 * @param {String} o.id Id of target element
 * @param {Object} o.schema JSON schema to render
 * @param {Object} o.startVal JSON of initial values
 * @param {Object} o.options JSONEditor options
 */
export async function jedInit(o) {
  const h = mx.helpers;

  const dict = await getDictJsonEditorDict();
  await h.moduleLoad('json-editor');
  const id = o.id;
  const schema = o.schema;
  const startVal = o.startVal;
  const options = o.options;
  const JSONEditor = window.JSONEditor;
  if (dict) {
    JSONEditor.defaults.languages = dict;
  }
  JSONEditor.defaults.language = mx.settings.language;
  const elJed = document.getElementById(id);
  let draftLock = true;
  let draftDbTimeStamp = 0;
  let jed = window.jed;
  let idDraft;

  if (!elJed) {
    console.warn(`jed element ${id} not found`);
    return;
  }

  if (!jed) {
    window.jed = jed = {
      editors: {},
      helper: {},
      aceEditors: [],
      extend: {
        position: {},
        texteditor: {}
      }
    };
  }

  const opt_final = {};

  if (!options) {
    options = {};
  }

  // opt can't be changed after instantiation.
  const opt = {
    ajax: true,
    theme: 'bootstrap3',
    iconlib: 'bootstrap3',
    disable_collapse: false,
    disable_properties: true,
    disableSelectize: false,
    disable_edit_json: false,
    required_by_default: true,
    show_errors: 'always',
    no_additional_properties: true,
    schema: schema,
    startval: startVal,
    draftAutoSaveEnable: false,
    draftAutoSaveId: null,
    draftTimestamp: null,
    getValidationOnChange: false,
    getValuesOnChange: false
  };

   Object.assign(opt_final, opt, options);

  if (opt_final.draftAutoSaveId && opt_final.draftAutoSaveDbTimestamp) {
    idDraft = id + '@' + opt_final.draftAutoSaveId;
    draftDbTimeStamp = opt_final.draftAutoSaveDbTimestamp;
  }

  JSONEditor.plugins.ace.theme = 'github';
  JSONEditor.plugins.selectize.enable = !opt_final.disableSelectize;

  /**
   * Remove old editor if already exists
   */
  if (jed.editors[id] && h.isFunction(jed.editors[id].destroy)) {
    jed.editors[id].destroy();
  }
  /**
   * Create new editor
   */
  elJed.innerHTML = '';
  elJed.dataset.jed_id = id;
  const editor = new JSONEditor(elJed, opt_final);
  jed.editors[id] = editor;
  if (!jed.helper.translate) {
    /**
     * Translate not available in custom validator (not binded)..
     * we set one globaly here in jed object. Used in e.g. mx_extend_validation.js
     */
    jed.helper.translate = editor.translate;
  }

  /**
   * Test for readyness
   */
  editor.on('ready', async function() {
    /**
     * Auto save draft
     */
    if (idDraft) {
      try {
        const draft = await mx.data.draft.getItem(idDraft);
        draftLock = false;
        if (!draft || draft.type !== 'draft') {
          return;
        }
        const draftClientTimeStamp = draft.timestamp;
        // add 5 sec margin
        const moreRecent = draftClientTimeStamp > draftDbTimeStamp;

        if (moreRecent) {
          await jedShowDraftRecovery({
            jed: editor,
            idDraft: idDraft,
            timeDb: opt_final.draftAutoSaveDbTimestamp,
            draft: draft,
            saved: opt_final.startval
          });
        }
      } catch (e) {
        draftLock = false;
        throw new Error(e);
      }
    }
    /**
     * Report ready state to shiny
     */
    if (window.Shiny) {
      Shiny.onInputChange(id + '_ready', new Date());
    } else {
      console.log(id + '_ready');
    }
  });

  /**
   * On editor change
   */
  editor.on('change', async function() {
    if (idDraft && !draftLock) {
      const data = editor.getValue();
      await mx.data.draft.setItem(idDraft, {
        type: 'draft',
        timestamp: Math.round(Date.now() / 1000),
        data: data
      });
    }

    /**
     * Set custom ui classes for errors
     */
    jedAddAncestorErrors(editor);
    jedValidateSize(editor);
    if (opt_final.getValidationOnChange) {
      /**
       * Continous validation transfer on input
       */
      jedGetValidationById({id: id, idEvent: 'change'});
    }
    if (opt_final.getValuesOnChange) {
      /**
       * Continous data transfer on input
       */
      jedGetValuesById({id: id, idEvent: 'change'});
    }
  });
}

function jedValidateSize(editor) {
  /**
   * Test size
   */
  const h = mx.helpers;
  const values = editor.getValue();

  return h.getSizeOf(values, false).then(function(size) {
    if (size > mx.settings.maxByteJed) {
      const sizeReadable = h.formatByteSize(size);
      h.modal({
        addBackground: true,
        id: 'warningSize',
        title:
          'Warning : size greater than ' +
          mx.settings.maxByteJed +
          ' ( ' +
          sizeReadable +
          ')',
        content: h.el(
          'b',
          'Warning: this form data is too big. Please remove unnecessary item(s) and/or source data (images, binary files) from a dedicated server.'
        )
      });
    }
  });
}

/**
 * Add jed-error class to all ancestor of issue's element
 * @param {Object} editor json-editor
 */
function jedAddAncestorErrors(editor) {
  const elEditor = editor.element;
  const elsJedError = elEditor.querySelectorAll('.jed-error');

  for (let i = 0; i < elsJedError.length; i++) {
    elsJedError[i].classList.remove('jed-error');
  }

  const valid = editor.validate();
  const issueLength = valid.length;

  if (issueLength > 0) {
    valid.forEach((v) => {
      const p = v.path.split('.');
      const pL = p.length;
      for (let k = 0; k < pL; k++) {
        const elError = elEditor.querySelector(
          "[data-schemapath='" + p.join('.') + "']"
        );
        if (elError) {
          elError.classList.add('jed-error');
        }
        p.pop();
      }
    });
  }
}
/** Remove draft
 * @param {Object} o options
 * @param {String} o.id Id of the editor
 * @param {Object} o.idItem id of the item to remove
 */
export function jedRemoveDraft(o) {
  const idEditor = o.id;
  const idItem = o.idItem;
  const idDraft = idEditor + '@' + idItem;
  mx.data.draft.removeItem(idDraft).then(() => {
    console.log('item ' + idDraft + 'removed from mx.data.draft');
  });
}

/** Update jed editor
 * @param {Object} o options
 * @param {String} o.id Id of target element
 * @param {Object} o.val JSON of initial values
 */
export function jedUpdate(o) {
  const id = o.id;
  const val = o.val;
  const jed = mx.helpers.path(window, 'jed.editors.' + id);
  if (jed) {
    jed.setValue(val);
  }
}

/** Get jed editor value
 * @param {Object} o options
 * @param {String} o.id Id of target element
 */
export function jedGetValuesById(o) {
  const id = o.id;
  const jed = mx.helpers.path(window, 'jed.editors.' + id);
  if (jed) {
    const values = {
      data: jed.getValue(),
      time: Date.now(),
      idEvent: o.idEvent
    };
    if (values && window.Shiny) {
      Shiny.onInputChange(id + '_values', values);
    } else {
      return values;
    }
  }
}

/** Get jed editor validation
 * @param {Object} o options
 * @param {String} o.id Id of target element
 */
export function jedGetValidationById(o) {
  const id = o.id;
  const jed = mx.helpers.path(window, 'jed.editors.' + id);
  if (jed) {
    const valid = {
      data: jed.validate(),
      time: Date.now(),
      idEvent: o.idEvent
    };
    if (window.Shiny) {
      Shiny.onInputChange(id + '_issues', valid);
    } else {
      return values;
    }
  }
}
/** Show recovery panel
 * @param {Object} o options
 * @param {Object} o.jed Editor
 * @param {String} o.idDraft Id of the draft
 * @param {Object} o.draft draft to recover
 * @param {Object} o.saved data provided from db
 * @param {Number} o.timeDb Posix time stamp of the db version
 */
async function jedShowDraftRecovery(o) {
  const h = mx.helpers;
  const el = h.el;

  if (!o.draft || o.draft.type !== 'draft') {
    throw new Error({
      msg: 'Invalid draft',
      data: o.draft
    });
  }

  const jed = o.jed;
  const recoveredData = o.draft.data;
  const dbData = o.saved;
  const dateTimeDb = formatDateTime(o.timeDb);
  const dateTimeBrowser = formatDateTime(o.draft.timestamp);

  const diff = await getDiff();
  const isEmpty = h.isEmpty(diff);
  if (isEmpty) {
    return;
  }

  const btnYes = el('button', {
    type: 'button',
    class: ['btn', 'btn-default'],
    on: ['click', restore],
    dataset: {
      lang_key: 'draft_recover_use_most_recent'
    }
  });

  const btnDiffData = el('button', {
    type: 'button',
    class: ['btn', 'btn-default'],
    on: ['click', previewDiff],
    dataset: {
      lang_key: 'draft_recover_preview_diff'
    }
  });

  let elData;

  const modal = h.modal({
    addBackground: true,
    id: 'modalDataRecovery',
    title: h.el('span', {dataset: {lang_key: 'draft_recover_modal_title'}}),
    buttons: [btnYes, btnDiffData],
    textCloseButton: el('span', {
      dataset: {lang_key: 'draft_recover_cancel'}
    }),
    content: el(
      'div',
      el('h3', {
        dataset: {
          lang_key: 'draft_recover_summary_title'
        }
      }),
      el(
        'p',
        el(
          'ul',
          el(
            'li',
            el('span', {
              dataset: {lang_key: 'draft_recover_last_saved_date'}
            }),
            el('span', ': ' + dateTimeDb)
          ),
          el(
            'li',
            el('span', {
              dataset: {lang_key: 'draft_recover_recovered_date'}
            }),
            el('span', ': ' + dateTimeBrowser)
          )
        ),
        (elData = el('div'))
      )
    )
  });

  h.updateLanguageElements({
    el: modal
  });

  function getDiff() {
    return h.jsonDiff(dbData, recoveredData, {
      propertyFilter: function(name) {
        const firstChar = name.slice(0, 1);
        /**
         * Set of known key that should not be used in diff
         */
        return (
          name !== 'spriteEnable' && firstChar !== '_' && firstChar !== '$'
        );
      }
    });
  }

  async function previewDiff() {
    const elItem = el('div', {
      class: ['mx-diff-item']
    });
    elData.innerHTML = '';
    elData.classList.add('mx-diff-items');
    elData.appendChild(
      el('h3', el('span', {dataset: {lang_key: 'draft_recover_diffs'}}))
    );
    elData.appendChild(elItem);
    const html = await h.jsonDiff(dbData, recoveredData, {
      toHTML: true,
      propertyFilter: function(name) {
        const firstChar = name.slice(0, 1);
        /**
         * Set of known key that should not be used in diff
         */
        return (
          name !== 'spriteEnable' && firstChar !== '_' && firstChar !== '$'
        );
      }
    });
    elItem.innerHTML = html;
  }

  function restore() {
    delete recoveredData._timestamp;
    jed.setValue(recoveredData);
    modal.close();
  }
}

function formatDateTime(posix) {
  const d = new Date(posix * 1000);
  const date = d.toLocaleDateString();
  const time = d.toLocaleTimeString();
  return date + ' at ' + time;
}

/**
 * Translate MapX to JSONEditor dict
 *
 * @return {Promise} resolve to JSONEditor dict
 */
async function getDictJsonEditorDict() {
  const h = mx.helpers;
  const out = {};
  const dict = await h.getDict(mx.settings.language);
  /**
   * For each item
   */

  for (let d of dict) {
    let k = d.id;
    /**
     * For each language
     */

    for (let l in d) {
      if (l === 'id') {
        continue;
      }
      if (!out[l]) {
        out[l] = {};
      }
      out[l][k] = d[l];
    }
  }
  return out;
}
