import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ContestantForm } from "./ContestantForm";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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

interface Contestant {
  id: string;
  name: string;
  tagline: string | null;
  bio: string | null;
  achievements: string | null;
  vision: string | null;
  photo_url: string | null;
  video_url: string | null;
  vote_count: number;
}

export const ContestantsManager = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContestant, setEditingContestant] = useState<Contestant | null>(null);
  const [deleteContestant, setDeleteContestant] = useState<Contestant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestants();
  }, []);

  const fetchContestants = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contestants")
      .select("*")
      .order("vote_count", { ascending: false });

    if (error) {
      toast.error("Failed to load contestants");
      console.error(error);
    } else {
      setContestants(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteContestant) return;

    const { error } = await supabase
      .from("contestants")
      .delete()
      .eq("id", deleteContestant.id);

    if (error) {
      toast.error("Failed to delete contestant");
      console.error(error);
    } else {
      toast.success("Contestant deleted successfully");
      fetchContestants();
    }
    setDeleteContestant(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Contestants</CardTitle>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-gradient-primary hover:opacity-90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Contestant
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contestants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No contestants added yet</p>
              <Button onClick={() => setShowForm(true)} variant="outline">
                Add your first contestant
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contestants.map((contestant) => (
                <Card key={contestant.id} className="overflow-hidden hover:shadow-soft transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 ring-2 ring-primary/10">
                        <AvatarImage src={contestant.photo_url || undefined} />
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground">
                          {contestant.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{contestant.name}</h3>
                        {contestant.tagline && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {contestant.tagline}
                          </p>
                        )}
                        <Badge className="mt-2 bg-accent text-accent-foreground">
                          {contestant.vote_count} votes
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => {
                            setEditingContestant(contestant);
                            setShowForm(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setDeleteContestant(contestant)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
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

      <ContestantForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingContestant(null);
        }}
        onSuccess={() => {
          fetchContestants();
          setShowForm(false);
          setEditingContestant(null);
        }}
        contestant={editingContestant}
      />

      <AlertDialog open={!!deleteContestant} onOpenChange={() => setDeleteContestant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contestant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deleteContestant?.name}? This action cannot be undone
              and will also delete all votes for this contestant.
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
