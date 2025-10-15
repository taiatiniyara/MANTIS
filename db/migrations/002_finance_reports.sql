-- ===========================================
-- Finance Reports View
-- Aggregates infringements by agency and GL code
-- ===========================================

create or replace view finance_reports as
select
    i.agency_id,
    a.name as agency_name,
    it.gl_code,
    it.code as infringement_code,
    it.name as infringement_name,
    count(i.id) as infringement_count,
    sum(it.fine_amount) as total_fines,
    min(i.issued_at) as first_infringement,
    max(i.issued_at) as last_infringement
from infringements i
join agencies a on i.agency_id = a.id
join infringement_types it on i.type_id = it.id
group by i.agency_id, a.name, it.gl_code, it.code, it.name
order by a.name, it.gl_code;
