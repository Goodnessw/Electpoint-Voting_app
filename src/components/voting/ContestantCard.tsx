import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Eye, Vote } from "lucide-react";
import { Contestant } from "@/pages/Vote";

interface ContestantCardProps {
  contestant: Contestant;
  onViewDetails: () => void;
  onVote: () => void;
  canVote: boolean;
  hideVoteCount?: boolean;
}

export const ContestantCard = ({ contestant, onViewDetails, onVote, canVote, hideVoteCount }: ContestantCardProps) => {
  return (
    <Card className="overflow-hidden hover:shadow-glow transition-all duration-300 group">
      <div className="p-6 flex flex-col items-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="w-32 h-32 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all duration-300">
            <AvatarImage src={contestant.photo_url || undefined} alt={contestant.name} />
            <AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
              {contestant.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {!hideVoteCount && (
            <Badge className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground shadow-soft">
              {contestant.vote_count} votes
            </Badge>
          )}
        </div>

        {/* Info */}
        <div className="text-center space-y-2 w-full">
          <h3 className="font-bold text-xl text-foreground">{contestant.name}</h3>
          {contestant.tagline && (
            <p className="text-sm text-muted-foreground line-clamp-2">{contestant.tagline}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="flex-1 gap-2"
          >
            <Eye className="w-4 h-4" />
            Details
          </Button>
          <Button
            size="sm"
            onClick={onVote}
            disabled={!canVote}
            className="flex-1 gap-2 bg-gradient-primary hover:opacity-90"
          >
            <Vote className="w-4 h-4" />
            Vote
          </Button>
        </div>
      </div>
    </Card>
  );
};
