import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Contestant } from "@/pages/Vote";

interface VoteDialogProps {
  contestant: Contestant | null;
  open: boolean;
  onClose: () => void;
  firstName: string;
  onFirstNameChange: (value: string) => void;
  lastName: string;
  onLastNameChange: (value: string) => void;
  onVote: () => void;
  canVote: boolean;
}

export const VoteDialog = ({
  contestant,
  open,
  onClose,
  firstName,
  onFirstNameChange,
  lastName,
  onLastNameChange,
  onVote,
  canVote,
}: VoteDialogProps) => {
  if (!contestant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Cast Your Vote</DialogTitle>
          <DialogDescription>
            Please provide your complete and authentic full name to vote for this contestant
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 my-4">
          <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
            ⚠️ Important: Votes submitted with incomplete names, nicknames, or inauthentic information will not be counted. 
            Please use your real, complete first and last name as it appears on official documents.
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
            <Avatar className="w-16 h-16 ring-2 ring-primary/10">
              <AvatarImage src={contestant.photo_url || undefined} />
              <AvatarFallback className="bg-gradient-primary text-primary-foreground text-lg">
                {contestant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{contestant.name}</h3>
              {contestant.tagline && (
                <p className="text-sm text-muted-foreground">{contestant.tagline}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input
                id="first-name"
                placeholder="Enter your first name"
                value={firstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                disabled={!canVote}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input
                id="last-name"
                placeholder="Enter your last name"
                value={lastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                disabled={!canVote}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={onVote}
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={!firstName.trim() || !lastName.trim() || !canVote}
          >
            Confirm Vote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
