import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Award, Target, FileText } from "lucide-react";
import { Contestant } from "@/pages/Vote";

interface ContestantModalProps {
  contestant: Contestant | null;
  open: boolean;
  onClose: () => void;
}

export const ContestantModal = ({ contestant, open, onClose }: ContestantModalProps) => {
  if (!contestant) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-20 h-20 ring-4 ring-primary/20">
              <AvatarImage src={contestant.photo_url || undefined} alt={contestant.name} />
              <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                {contestant.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{contestant.name}</DialogTitle>
              {contestant.tagline && (
                <p className="text-muted-foreground">{contestant.tagline}</p>
              )}
              <Badge className="mt-2 bg-accent text-accent-foreground">
                {contestant.vote_count} votes
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Bio */}
            {contestant.bio && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Biography</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{contestant.bio}</p>
              </div>
            )}

            {contestant.bio && contestant.achievements && <Separator />}

            {/* Achievements */}
            {contestant.achievements && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-lg">Achievements</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contestant.achievements}
                </p>
              </div>
            )}

            {contestant.achievements && contestant.vision && <Separator />}

            {/* Vision */}
            {contestant.vision && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Vision</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {contestant.vision}
                </p>
              </div>
            )}

            {/* Video */}
            {contestant.video_url && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Introduction Video</h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={contestant.video_url}
                    className="w-full h-full"
                    allowFullScreen
                    title={`${contestant.name} introduction video`}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
