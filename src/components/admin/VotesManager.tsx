import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
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

export const VotesManager = () => {
  const [votes, setVotes] = useState<any[]>([]);
  const [deleteVote, setDeleteVote] = useState<{ id: string; contestantId: string; voterName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVotes();
  }, []);

  const fetchVotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("votes")
      .select("*, contestants(name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load votes");
    } else {
      setVotes(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteVote) return;
    
    const { error } = await supabase.from("votes").delete().eq("id", deleteVote.id);
    if (!error) {
      await supabase.rpc("decrement_vote_count", { contestant_uuid: deleteVote.contestantId });
      toast.success("Vote deleted");
      fetchVotes();
    } else {
      toast.error("Failed to delete vote");
    }
    setDeleteVote(null);
  };

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>All Votes ({votes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Voter Name</TableHead>
              <TableHead>Contestant</TableHead>
              <TableHead>Election ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {votes.map((vote) => (
              <TableRow key={vote.id}>
                <TableCell>{vote.voter_name}</TableCell>
                <TableCell>{vote.contestants?.name}</TableCell>
                <TableCell>{vote.election_id}</TableCell>
                <TableCell>{new Date(vote.created_at).toLocaleString()}</TableCell>
                <TableCell>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => setDeleteVote({ 
                      id: vote.id, 
                      contestantId: vote.contestant_id,
                      voterName: vote.voter_name 
                    })}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <AlertDialog open={!!deleteVote} onOpenChange={() => setDeleteVote(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Vote</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the vote from {deleteVote?.voterName}? This action cannot be undone
            and will decrement the contestant's vote count.
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
    </>
  );
};
