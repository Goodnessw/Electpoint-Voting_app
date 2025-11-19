import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ContestantCard } from "@/components/voting/ContestantCard";
import { ContestantModal } from "@/components/voting/ContestantModal";
import { VoteDialog } from "@/components/voting/VoteDialog";
import { ElectionBanner } from "@/components/voting/ElectionBanner";
import { toast } from "sonner";
import { Vote as VoteIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export interface Contestant {
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

export interface Election {
  id: string;
  name: string;
  election_id: string;
  status: "inactive" | "active" | "ended";
  starts_at: string | null;
  ends_at: string | null;
}

const Vote = () => {
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [election, setElection] = useState<Election | null>(null);
  const [selectedContestant, setSelectedContestant] = useState<Contestant | null>(null);
  const [voteContestant, setVoteContestant] = useState<Contestant | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElection();
    fetchContestants();
    
    const channel = supabase
      .channel("realtime-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "contestants" }, () => {
        fetchContestants();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "elections" }, () => {
        fetchElection();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check localStorage for voting status when election changes
  useEffect(() => {
    if (election) {
      const votedKey = `voted_${election.election_id}`;
      const hasVotedInElection = localStorage.getItem(votedKey) === "true";
      setHasVoted(hasVotedInElection);

      // Clear flag if election has ended
      if (election.status === "ended") {
        localStorage.removeItem(votedKey);
      }
    }
  }, [election]);

  const fetchElection = async () => {
    const { data, error } = await supabase
      .from("elections")
      .select("*")
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching election:", error);
    } else {
      setElection(data);
    }
  };

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

  const checkIfVoted = async (fullName: string) => {
    if (!election) return false;
    
    const { data } = await supabase
      .from("votes")
      .select("id")
      .eq("voter_name_lower", fullName.toLowerCase().trim())
      .eq("election_id", election.election_id)
      .maybeSingle();

    return !!data;
  };

  const handleVote = async () => {
    if (!voteContestant || !election || !firstName.trim() || !lastName.trim()) return;

    // Check if election is active
    if (election.status !== "active") {
      toast.error("Voting is not currently active");
      return;
    }

    // Validate name format - must be at least 2 characters each
    if (firstName.trim().length < 2 || lastName.trim().length < 2) {
      toast.error("Please enter your complete first and last name (minimum 2 characters each)");
      return;
    }

    // Check for nicknames or single character names
    const namePattern = /^[A-Za-z\s'-]+$/;
    if (!namePattern.test(firstName.trim()) || !namePattern.test(lastName.trim())) {
      toast.error("Please use only letters in your name. No numbers or special characters allowed.");
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Check if already voted with this name
    const alreadyVoted = await checkIfVoted(fullName);
    if (alreadyVoted) {
      toast.error("This name has already been used to vote in this election");
      return;
    }

    // Insert vote
    const { error: voteError } = await supabase.from("votes").insert({
      contestant_id: voteContestant.id,
      voter_name: fullName,
      voter_name_lower: fullName.toLowerCase().trim(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      election_id: election.election_id,
    });

    if (voteError) {
      if (voteError.code === "23505") {
        toast.error("This name has already been used to vote in this election");
      } else {
        toast.error("Failed to submit vote");
      }
      return;
    }

    // Increment vote count
    const { error: incrementError } = await supabase.rpc("increment_vote_count", {
      contestant_uuid: voteContestant.id,
    });

    if (incrementError) {
      console.error("Error incrementing vote:", incrementError);
    }

    toast.success(`Vote cast for ${voteContestant.name}!`);
    
    // Set localStorage flag for this election
    const votedKey = `voted_${election.election_id}`;
    localStorage.setItem(votedKey, "true");
    
    setHasVoted(true);
    setVoteContestant(null);
    setFirstName("");
    setLastName("");
    fetchContestants();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <VoteIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Church Election</h1>
                <p className="text-sm text-muted-foreground">Cast your vote with confidence</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm" className="gap-2">
                <Shield className="w-4 h-4" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Election Banner */}
      {election && <ElectionBanner election={election} />}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {!election ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-6 flex items-center justify-center">
              <VoteIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-3xl font-bold mb-4">No Active Election</h2>
            <p className="text-muted-foreground text-lg">
              There is currently no active election. Please check back later.
            </p>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : contestants.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4">No Contestants Yet</h2>
            <p className="text-muted-foreground">Contestants will appear here once added.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-center mb-12">Meet the Contestants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contestants.map((contestant) => (
                <ContestantCard
                  key={contestant.id}
                  contestant={contestant}
                  onViewDetails={() => setSelectedContestant(contestant)}
                  onVote={() => setVoteContestant(contestant)}
                  canVote={election.status === "active" && !hasVoted}
                  hideVoteCount={true}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <ContestantModal
        contestant={selectedContestant}
        open={!!selectedContestant}
        onClose={() => setSelectedContestant(null)}
      />

      <VoteDialog
        contestant={voteContestant}
        open={!!voteContestant}
        onClose={() => {
          setVoteContestant(null);
          setFirstName("");
          setLastName("");
        }}
        firstName={firstName}
        onFirstNameChange={setFirstName}
        lastName={lastName}
        onLastNameChange={setLastName}
        onVote={handleVote}
        canVote={election?.status === "active" && !hasVoted}
      />

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-20">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            Built with ❤️ by{" "}
            <a
              href="https://goodnessw.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium transition-colors"
            >
              Goodnessw
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Vote;
