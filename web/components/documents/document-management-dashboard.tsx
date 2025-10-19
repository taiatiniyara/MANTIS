'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { createClient } from '@/lib/supabase/client';
import { FileText, Download, Send, Eye, Edit, Trash2, Plus, FileSignature } from 'lucide-react';
import { format } from 'date-fns';

interface DocumentTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string | null;
  template_content: string;
  variables: any;
  is_active: boolean;
  created_at: string;
}

interface Document {
  id: string;
  template_id: string;
  document_type: string;
  document_number: string;
  title: string;
  status: string;
  generated_by: string;
  sent_at: string | null;
  created_at: string;
  template: DocumentTemplate[];
}

export function DocumentManagementDashboard() {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'notice',
    category: 'infringement',
    description: '',
    template_content: '',
    variables: {},
  });
  const supabase = createClient();

  useEffect(() => {
    loadTemplates();
    loadDocuments();
  }, []);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('document_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          template:document_templates(name, type)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const createTemplate = async () => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .insert({
          ...newTemplate,
          is_active: true,
        });

      if (error) throw error;

      setIsTemplateDialogOpen(false);
      setNewTemplate({
        name: '',
        type: 'notice',
        category: 'infringement',
        description: '',
        template_content: '',
        variables: {},
      });
      loadTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const generateDocument = async (templateId: string, data: any) => {
    try {
      const { error } = await supabase
        .from('documents')
        .insert({
          template_id: templateId,
          document_type: selectedTemplate?.type,
          title: data.title,
          content: renderTemplate(selectedTemplate?.template_content || '', data),
          status: 'generated',
          related_entity_type: data.related_entity_type,
          related_entity_id: data.related_entity_id,
        });

      if (error) throw error;

      setIsGenerateDialogOpen(false);
      loadDocuments();
    } catch (error) {
      console.error('Error generating document:', error);
    }
  };

  const renderTemplate = (template: string, data: any): string => {
    let rendered = template;
    
    Object.keys(data).forEach(key => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), data[key] || '');
    });
    
    return rendered;
  };

  const toggleTemplateStatus = async (templateId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('document_templates')
        .update({ is_active: !currentStatus })
        .eq('id', templateId);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error toggling template status:', error);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('document_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const downloadDocument = async (documentId: string, documentNumber: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/pdf`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentNumber}.pdf`;
      a.click();
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.is_active).length,
    totalDocuments: documents.length,
    generatedToday: documents.filter(d => 
      new Date(d.created_at).toDateString() === new Date().toDateString()
    ).length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeTemplates} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Generated Today</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.generatedToday}</div>
            <p className="text-xs text-muted-foreground">
              New documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Awaiting signature
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Document Management</CardTitle>
              <CardDescription>Manage templates and generate documents</CardDescription>
            </div>
            <Button onClick={() => setIsTemplateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="templates">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : templates.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No templates found
                        </TableCell>
                      </TableRow>
                    ) : (
                      templates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{template.type}</Badge>
                          </TableCell>
                          <TableCell>{template.category}</TableCell>
                          <TableCell>
                            <Badge className={template.is_active ? 'bg-green-500' : 'bg-gray-500'}>
                              {template.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedTemplate(template);
                                  setIsGenerateDialogOpen(true);
                                }}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Generate
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleTemplateStatus(template.id, template.is_active)}
                              >
                                {template.is_active ? 'Deactivate' : 'Activate'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteTemplate(template.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          No documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.document_number}</TableCell>
                          <TableCell>{doc.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{doc.document_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge>{doc.status}</Badge>
                          </TableCell>
                          <TableCell>
                            {format(new Date(doc.created_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => downloadDocument(doc.id, doc.document_number)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                PDF
                              </Button>
                              <Button variant="outline" size="sm">
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Document Template</DialogTitle>
            <DialogDescription>
              Create a new document template with placeholders
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Parking Infringement Notice"
                />
              </div>
              <div>
                <Label htmlFor="template-type">Type</Label>
                <Select
                  value={newTemplate.type}
                  onValueChange={(value) => setNewTemplate(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notice">Notice</SelectItem>
                    <SelectItem value="letter">Letter</SelectItem>
                    <SelectItem value="report">Report</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="certificate">Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="template-description">Description</Label>
              <Input
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the template"
              />
            </div>
            <div>
              <Label htmlFor="template-content">Template Content (HTML)</Label>
              <Textarea
                id="template-content"
                value={newTemplate.template_content}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, template_content: e.target.value }))}
                placeholder="Use {{variable_name}} for placeholders"
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Use double curly braces for variables: {'{{'} offender_name {'}}'},  {'{{'} infringement_number {'}}'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createTemplate}>Create Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Generate Document Dialog */}
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Document</DialogTitle>
            <DialogDescription>
              Fill in the details to generate a document from {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Document Title</Label>
              <Input placeholder="Enter document title" />
            </div>
            <div>
              <Label>Related Entity</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="infringement">Infringement</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="appeal">Appeal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGenerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button>Generate Document</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
