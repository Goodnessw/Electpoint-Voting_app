import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { LogOut, Users, Vote, Calendar, FileText } from "lucide-react";
import { ContestantsManager } from "./ContestantsManager";
import { ElectionsManager } from "./ElectionsManager";
import { VotesManager } from "./VotesManager";
import { ReportsView } from "./ReportsView";
import { Link } from "react-router-dom";

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState("contestants");

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center shadow-glow">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Admin Dashboard</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">Manage your church election</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link to="/" className="flex-1 sm:flex-initial">
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  <Vote className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">View Voting Page</span>
                  <span className="sm:hidden">Vote</span>
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 flex-1 sm:flex-initial">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="contestants" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Contestants</span>
            </TabsTrigger>
            <TabsTrigger value="elections" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Elections</span>
            </TabsTrigger>
            <TabsTrigger value="votes" className="gap-2">
              <Vote className="w-4 h-4" />
              <span className="hidden sm:inline">Votes</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contestants" className="space-y-4">
            <ContestantsManager />
          </TabsContent>

          <TabsContent value="elections" className="space-y-4">
            <ElectionsManager />
          </TabsContent>

          <TabsContent value="votes" className="space-y-4">
            <VotesManager />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsView />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};
