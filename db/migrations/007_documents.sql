-- Document Management System

-- Document templates table
create table if not exists document_templates (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  type text not null, -- 'notice', 'letter', 'report', 'receipt', 'certificate'
  category text not null, -- 'infringement', 'payment', 'appeal', 'general'
  description text,
  template_content text not null, -- HTML template with placeholders
  variables jsonb, -- List of available variables/placeholders
  is_active boolean default true,
  created_by uuid references users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Generated documents table
create table if not exists documents (
  id uuid primary key default uuid_generate_v4(),
  template_id uuid references document_templates(id),
  document_type text not null,
  document_number text unique not null,
  title text not null,
  content text not null, -- Rendered HTML content
  pdf_url text, -- URL to stored PDF
  related_entity_type text, -- 'infringement', 'payment', 'appeal', etc.
  related_entity_id uuid,
  status text default 'draft', -- 'draft', 'generated', 'sent', 'archived'
  generated_by uuid references users(id),
  sent_at timestamp with time zone,
  sent_to jsonb, -- Recipients info
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Document versions for tracking changes
create table if not exists document_versions (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  version_number integer not null,
  content text not null,
  pdf_url text,
  changed_by uuid references users(id),
  change_summary text,
  created_at timestamp with time zone default now(),
  unique(document_id, version_number)
);

-- Digital signatures
create table if not exists document_signatures (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  signer_id uuid not null references users(id),
  signer_name text not null,
  signer_role text not null,
  signature_type text not null, -- 'digital', 'electronic', 'manual'
  signature_data text, -- Base64 encoded signature image or certificate
  signed_at timestamp with time zone default now(),
  ip_address text,
  metadata jsonb
);

-- Document sharing and access control
create table if not exists document_shares (
  id uuid primary key default uuid_generate_v4(),
  document_id uuid not null references documents(id) on delete cascade,
  shared_with_user_id uuid references users(id),
  shared_with_email text,
  access_level text not null, -- 'view', 'download', 'edit'
  expires_at timestamp with time zone,
  access_count integer default 0,
  last_accessed_at timestamp with time zone,
  shared_by uuid references users(id),
  created_at timestamp with time zone default now()
);

-- Create indexes
create index if not exists idx_document_templates_type on document_templates(type);
create index if not exists idx_document_templates_category on document_templates(category);
create index if not exists idx_documents_document_number on documents(document_number);
create index if not exists idx_documents_template_id on documents(template_id);
create index if not exists idx_documents_status on documents(status);
create index if not exists idx_documents_related_entity on documents(related_entity_type, related_entity_id);
create index if not exists idx_document_versions_document_id on document_versions(document_id);
create index if not exists idx_document_signatures_document_id on document_signatures(document_id);
create index if not exists idx_document_shares_document_id on document_shares(document_id);

-- Enable RLS
alter table document_templates enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table document_signatures enable row level security;
alter table document_shares enable row level security;

-- RLS Policies for document_templates
create policy "Admins can manage templates"
  on document_templates for all
  to authenticated
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "All users can view active templates"
  on document_templates for select
  to authenticated
  using (is_active = true);

-- RLS Policies for documents
create policy "Users can view their own documents"
  on documents for select
  to authenticated
  using (
    generated_by = auth.uid()
    or exists (
      select 1 from document_shares
      where document_shares.document_id = documents.id
      and document_shares.shared_with_user_id = auth.uid()
    )
    or exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

create policy "Users can create documents"
  on documents for insert
  to authenticated
  with check (generated_by = auth.uid());

create policy "Users can update their own documents"
  on documents for update
  to authenticated
  using (
    generated_by = auth.uid()
    or exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role in ('super_admin', 'agency_admin', 'manager')
    )
  );

-- RLS Policies for document_versions
create policy "Users can view versions of accessible documents"
  on document_versions for select
  to authenticated
  using (
    exists (
      select 1 from documents
      where documents.id = document_versions.document_id
      and (
        documents.generated_by = auth.uid()
        or exists (
          select 1 from users
          where users.id = auth.uid()
          and users.role in ('super_admin', 'agency_admin', 'manager')
        )
      )
    )
  );

-- RLS Policies for document_signatures
create policy "Users can view signatures on accessible documents"
  on document_signatures for select
  to authenticated
  using (
    exists (
      select 1 from documents
      where documents.id = document_signatures.document_id
      and (
        documents.generated_by = auth.uid()
        or exists (
          select 1 from users
          where users.id = auth.uid()
          and users.role in ('super_admin', 'agency_admin', 'manager')
        )
      )
    )
  );

create policy "Users can sign documents"
  on document_signatures for insert
  to authenticated
  with check (signer_id = auth.uid());

-- RLS Policies for document_shares
create policy "Users can view shares of their documents"
  on document_shares for select
  to authenticated
  using (
    shared_with_user_id = auth.uid()
    or exists (
      select 1 from documents
      where documents.id = document_shares.document_id
      and documents.generated_by = auth.uid()
    )
  );

create policy "Document owners can share"
  on document_shares for insert
  to authenticated
  with check (
    exists (
      select 1 from documents
      where documents.id = document_shares.document_id
      and documents.generated_by = auth.uid()
    )
  );

-- Function to generate document number
create or replace function generate_document_number(doc_type text)
returns text
language plpgsql
as $$
declare
  v_number text;
  v_exists boolean;
  v_prefix text;
begin
  -- Set prefix based on document type
  v_prefix := case doc_type
    when 'notice' then 'NOT'
    when 'letter' then 'LTR'
    when 'report' then 'RPT'
    when 'receipt' then 'RCT'
    when 'certificate' then 'CERT'
    else 'DOC'
  end;
  
  loop
    v_number := v_prefix || '-' || to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 99999)::text, 5, '0');
    
    select exists(select 1 from documents where document_number = v_number) into v_exists;
    
    if not v_exists then
      return v_number;
    end if;
  end loop;
end;
$$;

-- Trigger to set document number
create or replace function set_document_number()
returns trigger
language plpgsql
as $$
begin
  if new.document_number is null then
    new.document_number := generate_document_number(new.document_type);
  end if;
  
  new.updated_at := now();
  
  return new;
end;
$$;

create trigger trigger_set_document_number
  before insert or update on documents
  for each row
  execute function set_document_number();

-- Function to create document version
create or replace function create_document_version()
returns trigger
language plpgsql
as $$
declare
  v_version_number integer;
begin
  if new.content != old.content or new.pdf_url != old.pdf_url then
    select coalesce(max(version_number), 0) + 1
    into v_version_number
    from document_versions
    where document_id = new.id;
    
    insert into document_versions (
      document_id,
      version_number,
      content,
      pdf_url,
      changed_by,
      change_summary
    ) values (
      new.id,
      v_version_number,
      new.content,
      new.pdf_url,
      auth.uid(),
      'Document updated'
    );
  end if;
  
  return new;
end;
$$;

create trigger trigger_create_document_version
  after update on documents
  for each row
  execute function create_document_version();
