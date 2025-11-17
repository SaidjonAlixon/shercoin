import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Clock, ExternalLink } from "lucide-react";
import { formatNumber } from "@/lib/format";

interface Task {
  id: number;
  title: string;
  description: string;
  reward: number;
  type: string;
  link?: string;
  status: "new" | "in_progress" | "checking" | "done";
}

interface TopshiriqlarProps {
  tasks: Task[];
  onTaskStart: (taskId: number) => void;
  onTaskVerify: (taskId: number) => void;
  onTaskClaim: (taskId: number) => void;
}

export function Topshiriqlar({
  tasks,
  onTaskStart,
  onTaskVerify,
  onTaskClaim,
}: TopshiriqlarProps) {
  const [activeTab, setActiveTab] = useState("daily");

  const dailyTasks = tasks.filter((t) => t.type === "daily");
  const onceTasks = tasks.filter((t) => t.type === "once");
  const specialTasks = tasks.filter((t) => t.type === "special");

  const TaskCard = ({ task }: { task: Task }) => {
    const getStatusIcon = () => {
      switch (task.status) {
        case "done":
          return <CheckCircle2 className="w-5 h-5 text-green-500" />;
        case "checking":
          return <Clock className="w-5 h-5 text-accent" />;
        case "in_progress":
          return <Circle className="w-5 h-5 text-primary" />;
        default:
          return <Circle className="w-5 h-5 text-muted-foreground" />;
      }
    };

    const getActionButton = () => {
      switch (task.status) {
        case "new":
          return (
            <Button
              onClick={() => {
                if (task.link) {
                  window.open(task.link, "_blank");
                }
                onTaskStart(task.id);
              }}
              data-testid={`button-start-task-${task.id}`}
            >
              Boshlash
            </Button>
          );
        case "in_progress":
          return (
            <Button
              variant="outline"
              onClick={() => onTaskVerify(task.id)}
              data-testid={`button-verify-task-${task.id}`}
            >
              Tekshirish
            </Button>
          );
        case "checking":
          return (
            <Button
              onClick={() => onTaskClaim(task.id)}
              data-testid={`button-claim-task-${task.id}`}
            >
              Mukofotni olish
            </Button>
          );
        case "done":
          return (
            <Badge variant="secondary" className="px-4 py-1.5">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Bajarilgan
            </Badge>
          );
      }
    };

    return (
      <Card key={task.id} className="p-4" data-testid={`card-task-${task.id}`}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-bold text-sm">{task.title}</h3>
              {task.link && (
                <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              {task.description}
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-gold">
                +{formatNumber(task.reward)} SherCoin
              </span>
              {getActionButton()}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="flex flex-col min-h-screen pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Topshiriqlar</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily" data-testid="tab-daily-tasks">
              Kundalik
            </TabsTrigger>
            <TabsTrigger value="once" data-testid="tab-once-tasks">
              Bir martalik
            </TabsTrigger>
            <TabsTrigger value="special" data-testid="tab-special-tasks">
              Sher-maks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-3">
            {dailyTasks.length > 0 ? (
              dailyTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Kundalik topshiriqlar topilmadi
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="once" className="space-y-3">
            {onceTasks.length > 0 ? (
              onceTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Bir martalik topshiriqlar topilmadi
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="special" className="space-y-3">
            {specialTasks.length > 0 ? (
              specialTasks.map((task) => <TaskCard key={task.id} task={task} />)
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Maxsus topshiriqlar topilmadi
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
