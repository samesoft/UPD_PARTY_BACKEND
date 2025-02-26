CREATE OR REPLACE FUNCTION public.get_regions_by_state(p_stateId integer)
 RETURNS TABLE(regionid integer, region character varying, stateid integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY 
    SELECT r.regionid, r.region, r.stateid 
    FROM public.region r WHERE p_stateId IS NOT NULL AND r.stateid = p_stateId;
END;
$function$;

CREATE OR REPLACE FUNCTION public.region_insert(p_regionId INTEGER, p_region character varying, p_stateid INTEGER)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.region (regionid, region, stateid)
    VALUES (p_regionId, p_region, p_stateid);
    ON CONFLICT (regionid) DO NOTHING;
END;
$function$;