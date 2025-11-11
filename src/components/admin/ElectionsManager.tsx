import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Square, RotateCcw, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ElectionForm } from "./ElectionForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Election {
  id: string;
  name: string;
  election_id: string;
  status: "inactive" | "active" | "ended";
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export const ElectionsManager = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [deleteElection, setDeleteElection] = useState<Election | null>(null);
  const [resetElection, setResetElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load elections");
      console.error(error);
    } else {
      setElections(data || []);
    }
    setLoading(false);
  };

  const handleStartElection = async (election: Election) => {
    // Set all other elections to inactive
    await supabase.from("elections").update({ status: "inactive" }).neq("id", election.id);

    const { error } = await supabase
      .from("elections")
      .update({ status: "active", starts_at: new Date().toISOString() })
      .eq("id", election.id);

    if (error) {
      toast.error("Failed to start election");
    } else {
      toast.success("Election started successfully");
      fetchElections();
    }
  };

  const handleEndElection = async (election: Election) => {
    const { error } = await supabase
      .from("elections")
      .update({ status: "ended", ends_at: new Date().toISOString() })
      .eq("id", election.id);

    if (error) {
      toast.error("Failed to end election");
    } else {
      toast.success("Election ended successfully");
      fetchElections();
    }
  };

  const handleResetElection = async () => {
    if (!resetElection) return;

    // Delete all votes for this election
    const { error: votesError } = await supabase
      .from("votes")
      .delete()
      .eq("election_id", resetElection.election_id);

    if (votesError) {
      toast.error("Failed to reset election");
      return;
    }

    // Reset all contestant vote counts to 0
    const { error: resetError } = await supabase.from("contestants").update({ vote_count: 0 });

    if (resetError) {
      toast.error("Failed to reset vote counts");
      return;
    }

    // Update election status
    const { error } = await supabase
      .from("elections")
      .update({ status: "inactive", starts_at: null, ends_at: null })
      .eq("id", resetElection.id);

    if (error) {
      toast.error("Failed to reset election");
    } else {
      toast.success("Election reset successfully");
      fetchElections();
    }
    setResetElection(null);
  };

  const handleDelete = async () => {
    if (!deleteElection) return;

    const { error } = await supabase.from("elections").delete().eq("id", deleteElection.id);

    if (error) {
      toast.error("Failed to delete election");
    } else {
      toast.success("Election deleted successfully");
      fetchElections();
    }
    setDeleteElection(null);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-500/10 text-green-700 border-green-500/20",
      ended: "bg-red-500/10 text-red-700 border-red-500/20",
      inactive: "bg-gray-500/10 text-gray-700 border-gray-500/20",
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.inactive} variant="outline">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Elections</CardTitle>
          <Button onClick={() => setShowForm(true)} className="bg-gradient-primary hover:opacity-90 gap-2">
            <Plus className="w-4 h-4" />
            Create Election
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : elections.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No elections created yet</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                Create your first election
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {elections.map((election) => (
                <Card key={election.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{election.name}</h3>
                          {getStatusBadge(election.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">ID: {election.election_id}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {election.status === "inactive" && (
                          <Button
                            size="sm"
                            onClick={() => handleStartElection(election)}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                          >
                            <Play className="w-4 h-4" />
                            Start
                          </Button>
                        )}
                        {election.status === "active" && (
                          <Button
                            size="sm"
                            onClick={() => handleEndElection(election)}
                            className="gap-2 bg-red-600 hover:bg-red-700"
                          >
                            <Square className="w-4 h-4" />
                            End
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResetElection(election)}
                          className="gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteElection(election)}
                          className="gap-2 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ElectionForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={() => {
          fetchElections();
          setShowForm(false);
        }}
      />

      <AlertDialog open={!!resetElection} onOpenChange={() => setResetElection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Election</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all votes for {resetElection?.name} and reset all vote counts to zero. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetElection} className="bg-destructive hover:bg-destructive/90">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteElection} onOpenChange={() => setDeleteElection(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Election</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteElection?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
