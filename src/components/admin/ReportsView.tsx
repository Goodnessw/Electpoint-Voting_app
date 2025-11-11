import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, BarChart3, Trophy, Users, Vote as VoteIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ContestantStats {
  id: string;
  name: string;
  vote_count: number;
  percentage: number;
  photo_url: string | null;
}

export const ReportsView = () => {
  const [stats, setStats] = useState({ 
    totalVotes: 0, 
    totalContestants: 0, 
    activeElections: 0 
  });
  const [contestants, setContestants] = useState<ContestantStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    
    // Fetch basic stats
    const [votes, contestantsCount, elections, contestantsData] = await Promise.all([
      supabase.from("votes").select("id", { count: "exact" }),
      supabase.from("contestants").select("id", { count: "exact" }),
      supabase.from("elections").select("id", { count: "exact" }).eq("status", "active"),
      supabase.from("contestants").select("id, name, vote_count, photo_url").order("vote_count", { ascending: false }),
    ]);

    const totalVotes = votes.count || 0;
    
    // Calculate percentages for each contestant
    const contestantsWithPercentage: ContestantStats[] = (contestantsData.data || []).map(c => ({
      ...c,
      percentage: totalVotes > 0 ? (c.vote_count / totalVotes) * 100 : 0
    }));

    setStats({
      totalVotes,
      totalContestants: contestantsCount.count || 0,
      activeElections: elections.count || 0,
    });
    
    setContestants(contestantsWithPercentage);
    setLoading(false);
  };

  const handlePrint = () => window.print();

  const topThree = contestants.slice(0, 3);

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header Card */}
      <Card className="print:shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Comprehensive Election Report
          </CardTitle>
          <Button onClick={handlePrint} className="gap-2 print:hidden">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-primary rounded-lg text-white shadow-glow">
              <VoteIcon className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="text-4xl font-bold mb-2">{stats.totalVotes}</h3>
              <p className="text-sm opacity-90">Total Votes Cast</p>
            </div>
            <div className="text-center p-6 bg-gradient-accent rounded-lg text-white shadow-glow">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="text-4xl font-bold mb-2">{stats.totalContestants}</h3>
              <p className="text-sm opacity-90">Total Contestants</p>
            </div>
            <div className="text-center p-6 bg-green-600 rounded-lg text-white shadow-elegant">
              <Trophy className="w-8 h-8 mx-auto mb-3 opacity-90" />
              <h3 className="text-4xl font-bold mb-2">{stats.activeElections}</h3>
              <p className="text-sm opacity-90">Active Elections</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <Card className="print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top 3 Contestants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {topThree.map((contestant, index) => (
                <div 
                  key={contestant.id}
                  className={`relative p-6 rounded-xl text-center border-2 transition-all ${
                    index === 0 
                      ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' 
                      : index === 1 
                      ? 'border-gray-400 bg-gray-50 dark:bg-gray-950/20'
                      : 'border-orange-400 bg-orange-50 dark:bg-orange-950/20'
                  }`}
                >
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg ${
                    index === 0 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : index === 1 
                      ? 'bg-gray-400 text-gray-900'
                      : 'bg-orange-400 text-orange-900'
                  }`}>
                    {index + 1}
                  </div>
                  
                  <div className="mt-4 mb-3">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-primary flex items-center justify-center text-2xl font-bold text-white shadow-glow">
                      {contestant.name.charAt(0)}
                    </div>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-1">{contestant.name}</h4>
                  <p className="text-3xl font-bold text-primary mb-1">{contestant.vote_count}</p>
                  <p className="text-sm text-muted-foreground mb-2">votes</p>
                  <div className="text-2xl font-bold text-primary">
                    {contestant.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Detailed Voting Results</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : contestants.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No voting data available</p>
          ) : (
            <div className="space-y-4">
              {contestants.map((contestant, index) => (
                <div 
                  key={contestant.id} 
                  className="p-4 border rounded-lg hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{contestant.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contestant.vote_count} votes • {contestant.percentage.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {contestant.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <Progress value={contestant.percentage} className="h-3" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <Card className="print:shadow-none">
        <CardHeader>
          <CardTitle>Election Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Total Votes Cast:</span>
              <span className="text-xl font-bold text-primary">{stats.totalVotes}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Total Contestants:</span>
              <span className="text-xl font-bold text-primary">{stats.totalContestants}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-medium">Average Votes per Contestant:</span>
              <span className="text-xl font-bold text-primary">
                {stats.totalContestants > 0 ? (stats.totalVotes / stats.totalContestants).toFixed(1) : 0}
              </span>
            </div>
            {contestants.length > 0 && (
              <>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Leading Contestant:</span>
                  <span className="text-xl font-bold text-primary">{contestants[0].name}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Winning Margin:</span>
                  <span className="text-xl font-bold text-primary">
                    {contestants.length > 1 
                      ? `${(contestants[0].percentage - contestants[1].percentage).toFixed(1)}%` 
                      : 'N/A'}
                  </span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};