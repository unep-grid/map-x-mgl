-- https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/
--
-- Calculate the equal interval bins for a given column
--
-- @param in_array An array of numbers to determine the best
--                   bin boundary
--
-- @param breaks The number of bins you want to find.
--  
--
-- Returns: upper edges of bins
-- 
--

CREATE OR REPLACE FUNCTION CDB_EqualIntervalBins ( in_array anyarray, breaks INT ) RETURNS anyarray as $$
WITH stats AS (
  SELECT min(e), (max(e)::decimal-min(e))/breaks AS del
    FROM (SELECT unnest(in_array) e) AS p)
SELECT array_agg(bins)
  FROM (
    SELECT min + generate_series(1,breaks)*del AS bins
      FROM stats) q;
$$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE;


-- https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/
--
-- Determine the Heads/Tails classifications from a numeric array
--
-- @param in_array A numeric array of numbers to determine the best
--            bins based on the Heads/Tails method.
--
-- @param breaks The number of bins you want to find.
--  
--

CREATE OR REPLACE FUNCTION CDB_HeadsTailsBins ( in_array NUMERIC[], breaks INT) RETURNS NUMERIC[] as $$ 
DECLARE 
    element_count INT4; 
    arr_mean numeric; 
    i INT := 2; 
    reply numeric[]; 
BEGIN 
    -- get the total size of our row
    element_count := array_upper(in_array, 1) - array_lower(in_array, 1); 
    -- ensure the ordering of in_array
    SELECT array_agg(e) INTO in_array FROM (SELECT unnest(in_array) e ORDER BY e) x;
    -- stop if no rows 
    IF element_count IS NULL THEN  
        RETURN NULL; 
    END IF; 
    -- stop if our breaks are more than our input array size
    IF element_count < breaks THEN  
        RETURN in_array; 
    END IF; 

    -- get our mean value
    SELECT avg(v) INTO arr_mean FROM (  SELECT unnest(in_array) as v ) x; 

    reply = Array[arr_mean];
    -- slice our bread
    LOOP  
        IF i > breaks THEN  EXIT;  END IF;  
        SELECT avg(e) INTO arr_mean FROM ( SELECT unnest(in_array) e) x WHERE e > reply[i-1];
        IF arr_mean IS NOT NULL THEN
            reply = array_append(reply, arr_mean);
        END IF;
        i := i+1; 
    END LOOP; 
    RETURN reply; 
END; 
$$ language plpgsql IMMUTABLE PARALLEL SAFE;


-- https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/
--
-- Determine the Jenks classifications from a numeric array
--
-- @param in_array A numeric array of numbers to determine the best
--            bins based on the Jenks method.
--
-- @param breaks The number of bins you want to find.
--
-- @param iterations The number of different starting positions to test.
--
-- @param invert Optional wheter to return the top of each bin (default)
--               or the bottom. BOOLEAN, default=FALSE.
--
--

CREATE OR REPLACE FUNCTION CDB_JenksBins(in_array NUMERIC[], breaks INT, iterations INT DEFAULT 0, invert BOOLEAN DEFAULT FALSE)
RETURNS NUMERIC[] as
$$
DECLARE
    in_matrix NUMERIC[][];
    in_unique_count BIGINT;

    shuffles INT;
    arr_mean NUMERIC;
    sdam NUMERIC;

    i INT;
    bot INT;
    top INT;

    tops INT[];
    classes INT[][];
    j INT := 1;
    curr_result NUMERIC[];
    best_result NUMERIC[];
    seedtarget TEXT;

BEGIN
    -- We clean the input array (remove NULLs) and create 2 arrays
    -- [1] contains the unique values in in_array
    -- [2] contains the number of appearances of those unique values
    SELECT ARRAY[array_agg(value), array_agg(count)] FROM
    (
        SELECT value, count(1)::numeric as count
        FROM  unnest(in_array) AS value
        WHERE value is NOT NULL
        GROUP BY value
        ORDER BY value
    ) __clean_array_q INTO in_matrix;

    -- Get the number of unique values
    in_unique_count := array_length(in_matrix[1:1], 2);

    IF in_unique_count IS NULL THEN
        RETURN NULL;
    END IF;

    IF in_unique_count <= breaks THEN
        -- There isn't enough distinct values for the requested breaks
        RETURN ARRAY(Select unnest(in_matrix[1:1])) _a;
    END IF;

    -- If not declated explicitly we iterate based on the length of the array
    IF iterations < 1 THEN
        -- This is based on a 'looks fine' heuristic
        iterations := log(in_unique_count)::integer + 1;
    END IF;

    -- We set the number of shuffles per iteration as the number of unique values but
    -- this is just another 'looks fine' heuristic
    shuffles := in_unique_count;

    -- Get the mean value of the whole vector (already ignores NULLs)
    SELECT avg(v) INTO arr_mean FROM ( SELECT unnest(in_array) as v ) x;

    -- Calculate the sum of squared deviations from the array mean (SDAM).
    SELECT sum(((arr_mean - v)^2) * w) INTO sdam FROM (
        SELECT unnest(in_matrix[1:1]) as v, unnest(in_matrix[2:2]) as w
        ) x;

    -- To start, we create ranges with approximately the same amount of different values
    top := 0;
    i := 1;
    LOOP
        bot := top + 1;
        top := ROUND(i * in_unique_count::numeric / breaks::NUMERIC);

        IF i = 1 THEN
            classes = ARRAY[ARRAY[bot,top]];
        ELSE
            classes = ARRAY_CAT(classes, ARRAY[bot,top]);
        END IF;

        i := i + 1;
        IF i > breaks THEN EXIT; END IF;
    END LOOP;

    best_result = CDB_JenksBinsIteration(in_matrix, breaks, classes, invert, sdam, shuffles);

    --set the seed so we can ensure the same results
    SELECT setseed(0.4567) INTO seedtarget;
    --loop through random starting positions
    LOOP
        IF j > iterations-1 THEN  EXIT;  END IF;
        i = 1;
        tops = ARRAY[in_unique_count];
        LOOP
            IF i = breaks THEN  EXIT;  END IF;
            SELECT array_agg(distinct e) INTO tops FROM (
                SELECT unnest(array_cat(tops, ARRAY[trunc(random() * in_unique_count::float8)::int + 1])) as e ORDER BY e
                ) x;
            i = array_length(tops, 1);
        END LOOP;
        top := 0;
        i = 1;
        LOOP
            bot := top + 1;
            top = tops[i];
            IF i = 1 THEN
                classes = ARRAY[ARRAY[bot,top]];
            ELSE
                classes = ARRAY_CAT(classes, ARRAY[bot,top]);
            END IF;

            i := i+1;
            IF i > breaks THEN EXIT; END IF;
        END LOOP;

        curr_result = CDB_JenksBinsIteration(in_matrix, breaks, classes, invert, sdam, shuffles);

        IF curr_result[1] > best_result[1] THEN
            best_result = curr_result;
        END IF;

        j = j+1;
    END LOOP;

    RETURN (best_result)[2:array_upper(best_result, 1)];
END;
$$ LANGUAGE PLPGSQL IMMUTABLE PARALLEL RESTRICTED;


--
-- Perform a single iteration of the Jenks classification
--
-- Returns an array with:
-- - First element: gvf
-- - Second to 2+n: Category limits
DROP FUNCTION IF EXISTS CDB_JenksBinsIteration ( in_matrix NUMERIC[], breaks INT, classes INT[], invert BOOLEAN, element_count INT4, arr_mean NUMERIC, max_search INT); -- Old signature

CREATE OR REPLACE FUNCTION CDB_JenksBinsIteration ( in_matrix NUMERIC[], breaks INT, classes INT[], invert BOOLEAN, sdam NUMERIC, max_search INT DEFAULT 50) RETURNS NUMERIC[] as $$
DECLARE
    i INT;
    iterations INT = 0;

    side INT := 2;

    gvf numeric := 0.0;
    new_gvf numeric;
    arr_gvf numeric[];
    arr_avg numeric[];
    class_avg numeric;
    class_dev numeric;

    class_max_i INT = 0;
    class_min_i INT = 0;
    dev_max numeric;
    dev_min numeric;

    best_classes INT[] = classes;
    best_gvf numeric[];
    best_avg numeric[];
    move_elements INT = 1;

    reply numeric[];

BEGIN

    -- We fill the arrays with the initial values
    i = 0;
    LOOP
        IF i = breaks THEN EXIT; END IF;
        i = i + 1;

        -- Get class mean
        SELECT (sum(v * w) / sum(w)) INTO class_avg FROM (
            SELECT unnest(in_matrix[1:1][classes[i][1]:classes[i][2]]) as v,
                    unnest(in_matrix[2:2][classes[i][1]:classes[i][2]]) as w
            ) x;

        -- Get class deviation
        SELECT sum((class_avg - v)^2 * w) INTO class_dev FROM (
            SELECT unnest(in_matrix[1:1][classes[i][1]:classes[i][2]]) as v,
                    unnest(in_matrix[2:2][classes[i][1]:classes[i][2]]) as w
            ) x;


        IF i = 1 THEN
            arr_avg = ARRAY[class_avg];
            arr_gvf = ARRAY[class_dev];
        ELSE
            arr_avg = array_append(arr_avg, class_avg);
            arr_gvf = array_append(arr_gvf, class_dev);
        END IF;
    END LOOP;

    -- We copy the values to avoid recalculation when a failure happens
    best_avg = arr_avg;
    best_gvf = arr_gvf;

    iterations = 0;
    LOOP
        IF iterations = max_search THEN EXIT; END IF;
        iterations = iterations + 1;

        -- calculate our new GVF
        SELECT sdam - sum(e) INTO new_gvf FROM ( SELECT unnest(arr_gvf) as e ) x;

        -- Check if any improvement was made
        IF new_gvf <= gvf THEN
            -- If we were moving too many elements, go back and move less
            IF move_elements <= 2 OR class_max_i = class_min_i THEN
                EXIT;
            END IF;

            move_elements = GREATEST(move_elements / 8, 1);

            -- Rollback from saved statuses
            classes = best_classes;
            new_gvf = gvf;

            i = class_min_i;
            LOOP
                arr_avg[i] = best_avg[i];
                arr_gvf[i] = best_gvf[i];

                IF i = class_max_i THEN EXIT; END IF;
                i = i + 1;
            END LOOP;
        END IF;

        -- We search for the classes with the min and max deviation
        i = 1;
        class_min_i = 1;
        class_max_i = 1;
        dev_max = arr_gvf[1];
        dev_min = arr_gvf[1];
        LOOP
            IF i = breaks THEN EXIT; END IF;
            i = i + 1;

            IF arr_gvf[i] < dev_min THEN
                dev_min = arr_gvf[i];
                class_min_i = i;
            ELSE
                IF arr_gvf[i] > dev_max THEN
                    dev_max = arr_gvf[i];
                    class_max_i = i;
                END IF;
            END IF;
        END LOOP;


        -- Save best values for comparison and output
        gvf = new_gvf;
        best_classes = classes;

        -- Limit the moved elements as to not remove everything from class_max_i
        move_elements = LEAST(move_elements, classes[class_max_i][2] - classes[class_max_i][1]);

        -- Move `move_elements` from class_max_i to class_min_i
        IF class_min_i < class_max_i THEN
            i := class_min_i;
            LOOP
                IF i = class_max_i THEN EXIT; END IF;
                classes[i][2] = classes[i][2] + move_elements;
                i := i + 1;
            END LOOP;

            i := class_max_i;
            LOOP
                IF i = class_min_i THEN EXIT; END IF;
                classes[i][1] = classes[i][1] + move_elements;
                i := i - 1;
            END LOOP;
        ELSE
            i := class_min_i;
            LOOP
                IF i = class_max_i THEN EXIT; END IF;
                classes[i][1] = classes[i][1] - move_elements;
                i := i - 1;
            END LOOP;

            i := class_max_i;
            LOOP
                IF i = class_min_i THEN EXIT; END IF;
                classes[i][2] = classes[i][2] - move_elements;
                i := i + 1;
            END LOOP;
        END IF;

        -- Recalculate avg and deviation ONLY for the affected classes
        i = LEAST(class_min_i, class_max_i);
        class_max_i = GREATEST(class_min_i, class_max_i);
        class_min_i = i;
        LOOP
            SELECT (sum(v * w) / sum(w)) INTO class_avg FROM (
                SELECT unnest(in_matrix[1:1][classes[i][1]:classes[i][2]]) as v,
                        unnest(in_matrix[2:2][classes[i][1]:classes[i][2]]) as w
                ) x;

            SELECT sum((class_avg - v)^2 * w) INTO class_dev FROM (
                SELECT unnest(in_matrix[1:1][classes[i][1]:classes[i][2]]) as v,
                        unnest(in_matrix[2:2][classes[i][1]:classes[i][2]]) as w
                ) x;

            -- Save status (in case it's needed for rollback) and store the new one
            best_avg[i] = arr_avg[i];
            arr_avg[i] = class_avg;

            best_gvf[i] = arr_gvf[i];
            arr_gvf[i] = class_dev;

            IF i = class_max_i THEN EXIT; END IF;
            i = i + 1;
        END LOOP;

        move_elements = move_elements * 2;

    END LOOP;

    i = 1;
    LOOP
        IF invert = TRUE THEN
            side = 1; --default returns bottom side of breaks, invert returns top side
        END IF;
        reply = array_append(reply, unnest(in_matrix[1:1][best_classes[i][side]:best_classes[i][side]]));
        i = i+1;
        IF i > breaks THEN  EXIT; END IF;
    END LOOP;

    reply = array_prepend(gvf, reply);
    RETURN reply;

END;
$$ LANGUAGE PLPGSQL IMMUTABLE PARALLEL SAFE;


-- https://github.com/CartoDB/cartodb-postgresql/blob/master/scripts-available/
--
-- Determine the Quantile classifications from a numeric array
--
-- @param in_array A numeric array of numbers to determine the best
--            bins based on the Quantile method.
--
-- @param breaks The number of bins you want to find.
--
--
CREATE OR REPLACE FUNCTION CDB_QuantileBins(in_array numeric[], breaks int)
RETURNS numeric[]
AS $$
  SELECT
    percentile_disc(Array(SELECT generate_series(1, breaks) / breaks::numeric))
    WITHIN GROUP (ORDER BY x ASC) AS p
  FROM
    unnest(in_array) AS x;
$$ language SQL IMMUTABLE STRICT PARALLEL SAFE;
--
-- FUNCTION: public.mx_decrypt(text, text)
--
CREATE OR REPLACE FUNCTION public.mx_decrypt(
	data text,
	psw text)
    RETURNS text
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
AS $BODY$
BEGIN
  RETURN pgp_sym_decrypt(decode(data,'hex'),psw);
  EXCEPTION
WHEN others THEN
  RAISE USING
  MESSAGE = format('Decryption failed. sqlstate: %s, message: %s',
    SQLSTATE,SQLERRM);
  RETURN NULL;
END;
$BODY$;

ALTER FUNCTION public.mx_decrypt(text, text)
    OWNER TO postgres;


--
-- FUNCTION: public.mx_encrypt(text, text)
--

CREATE OR REPLACE FUNCTION public.mx_encrypt(
	data text,
	psw text)
    RETURNS text
    LANGUAGE 'plpgsql'

    COST 100
    VOLATILE
AS $BODY$
BEGIN
  RETURN encode(pgp_sym_encrypt(data,psw),'hex');
  EXCEPTION
WHEN others THEN
  RAISE USING
  MESSAGE = format('Encryption failed. sqlstate: %s, message: %s',
    SQLSTATE,SQLERRM);
  RETURN NULL;
END;
$BODY$;

ALTER FUNCTION public.mx_encrypt(text, text)
    OWNER TO postgres;


--
-- FUNCTION: public.mx_getgeojsonquery(text, double precision, text)
--

CREATE OR REPLACE FUNCTION public.mx_getgeojsonquery(
	_idview text,
	_zoom double precision,
	_bbox text,
	OUT result text)
    RETURNS text
    LANGUAGE 'plpgsql'

    COST 100
    IMMUTABLE
AS $BODY$
DECLARE
_idSource text;
_idSourceMask text;

BEGIN
  WITH _layers AS (
    SELECT data#>'{"source","layerInfo"}' AS info 
    FROM mx_views
    WHERE id = _idView
    ORDER BY date_modified DESC
    LIMIT 1 )
  SELECT info->>'name', info->>'maskName' INTO _idSource, _idSourceMask FROM _layers ;

  IF _idSource != '{}' THEN
    EXECUTE format(
      'SELECT count(geom)::int FROM %I AS t'
      , _idSource) INTO result;
  ELSE
END IF;
END;
$BODY$;

ALTER FUNCTION public.mx_getgeojsonquery(text, double precision, text)
    OWNER TO postgres;


--
-- FUNCTION: public.tilebbox(integer, integer, integer, integer)
--

CREATE OR REPLACE FUNCTION public.tilebbox(
	z integer,
	x integer,
	y integer,
	srid integer DEFAULT 3857)
    RETURNS geometry
    LANGUAGE 'plpgsql'

    COST 100
    IMMUTABLE
AS $BODY$
declare
    max numeric := 20037508.34;
    res numeric := (max*2)/(2^z);
    bbox geometry;
begin
    bbox := ST_MakeEnvelope(
        -max + (x * res),
        max - (y * res),
        -max + (x * res) + res,
        max - (y * res) - res,
        3857
    );
    if srid = 3857 then
        return bbox;
    else
        return ST_Transform(bbox, srid);
    end if;
end;
$BODY$;

ALTER FUNCTION public.tilebbox(integer, integer, integer, integer)
    OWNER TO mapxw;
