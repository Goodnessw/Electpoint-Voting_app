import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { Election } from "@/pages/Vote";

interface ElectionBannerProps {
  election: Election;
}

export const ElectionBanner = ({ election }: ElectionBannerProps) => {
  const getStatusIcon = () => {
    switch (election.status) {
      case "active":
        return <CheckCircle className="w-5 h-5" />;
      case "ended":
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusColor = () => {
    switch (election.status) {
      case "active":
        return "bg-green-500/10 text-green-700 border-green-500/20";
      case "ended":
        return "bg-red-500/10 text-red-700 border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
    }
  };

  const getStatusText = () => {
    switch (election.status) {
      case "active":
        return "Voting is Open";
      case "ended":
        return "Voting Closed";
      default:
        return "Voting Not Started";
    }
  };

  return (
    <div className="bg-card border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold mb-1">{election.name}</h2>
            <p className="text-sm text-muted-foreground">Election ID: {election.election_id}</p>
          </div>
          <Badge className={`gap-2 px-4 py-2 ${getStatusColor()}`} variant="outline">
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
        </div>
      </div>
    </div>
  );
};
