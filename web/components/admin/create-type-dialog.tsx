"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

interface Category {
  id: string;
  name: string;
}

interface CreateTypeDialogProps {
  categories: Category[];
  children: React.ReactNode;
}

export function CreateTypeDialog({
  categories,
  children,
}: CreateTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    code: "",
    name: "",
    description: "",
    fine_amount: "",
    demerit_points: "",
    gl_code: "",
  });
  const router = useRouter();
  

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !formData.category_id ||
      !formData.code.trim() ||
      !formData.name.trim() ||
      !formData.gl_code.trim()
    ) {
      toast.error("Category, code, name, and GL code are required");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("infringement_types").insert({
      category_id: formData.category_id,
      code: formData.code.trim().toUpperCase(),
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      fine_amount: formData.fine_amount
        ? parseFloat(formData.fine_amount)
        : null,
      demerit_points: formData.demerit_points
        ? parseInt(formData.demerit_points)
        : null,
      gl_code: formData.gl_code.trim().toUpperCase(),
    });

    if (error) {
      if (error.code === "23505") {
        toast.error("A type with this code already exists");
      } else {
        toast.error("Failed to create infringement type");
        console.error(error);
      }
    } else {
      toast.success("Infringement type created successfully");
      setFormData({
        category_id: "",
        code: "",
        name: "",
        description: "",
        fine_amount: "",
        demerit_points: "",
        gl_code: "",
      });
      setOpen(false);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Infringement Type</DialogTitle>
            <DialogDescription>
              Add a new infringement type with fine and GL code
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., T001"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Type Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Speeding in Urban Area"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter type description..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fine_amount">Fine Amount ($)</Label>
                <Input
                  id="fine_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.fine_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, fine_amount: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="demerit_points">Demerit Points</Label>
                <Input
                  id="demerit_points"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.demerit_points}
                  onChange={(e) =>
                    setFormData({ ...formData, demerit_points: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gl_code">GL Code *</Label>
                <Input
                  id="gl_code"
                  placeholder="e.g., GL-4001"
                  value={formData.gl_code}
                  onChange={(e) =>
                    setFormData({ ...formData, gl_code: e.target.value })
                  }
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
