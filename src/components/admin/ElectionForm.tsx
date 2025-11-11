import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ElectionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ElectionForm = ({ open, onClose, onSuccess }: ElectionFormProps) => {
  const [name, setName] = useState("");
  const [electionId, setElectionId] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("elections").insert({
      name,
      election_id: electionId,
      status: "inactive",
    });

    if (error) {
      toast.error("Failed to create election");
      console.error(error);
    } else {
      toast.success("Election created successfully");
      setName("");
      setElectionId("");
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Election</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Election Name *</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Church Leadership Election 2024"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="election_id">Election ID *</Label>
            <Input
              id="election_id"
              required
              value={electionId}
              onChange={(e) => setElectionId(e.target.value)}
              placeholder="e.g., election-2024"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary">
              {loading ? "Creating..." : "Create Election"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
