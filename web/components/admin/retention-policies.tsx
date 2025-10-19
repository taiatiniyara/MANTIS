"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Clock, Archive, Trash2, Edit } from "lucide-react";

interface RetentionPoliciesProps {
  policies: any[];
}

export function RetentionPolicies({ policies }: RetentionPoliciesProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Retention Policies
            </CardTitle>
            <CardDescription>
              Manage data retention and archival rules
            </CardDescription>
          </div>
          <Button>
            Add Policy
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {policies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Table</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Actions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">
                    {policy.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.table_name}</Badge>
                  </TableCell>
                  <TableCell>{policy.retention_days} days</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {policy.archive_enabled && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Archive className="h-3 w-3" />
                          Archive
                        </Badge>
                      )}
                      {policy.delete_enabled && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={policy.is_active ? "default" : "outline"}
                      className={policy.is_active ? "bg-green-100 text-green-800" : ""}
                    >
                      {policy.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No retention policies configured</p>
            <p className="text-sm">Create a policy to automate data archiving</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
