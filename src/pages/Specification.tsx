import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ArrowLeft,
  FileText,
  Edit3,
  Save,
  Download,
  Upload,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  BookOpen,
  Layers,
  Code,
  Database,
  Users,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// The specification content - in a real app this would come from a file or API
const SPECIFICATION_CONTENT = `# DocBuilder - Baseline Specification Document

> **Version:** 1.0.0
> **Last Updated:** 2026-01-12
> **Status:** Authoritative Baseline

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Data Models](#5-data-models)
6. [User Interface Components](#6-user-interface-components)
7. [User Flows](#7-user-flows)
8. [API Integration](#8-api-integration)
9. [Database Schema](#9-database-schema)
10. [Features Specification](#10-features-specification)
11. [Export Formats](#11-export-formats)
12. [Accessibility](#12-accessibility)
13. [Security](#13-security)
14. [Dependencies](#14-dependencies)
15. [Changelog](#15-changelog)`;

interface DevTask {
  id: string;
  title: string;
  description: string;
  section: string;
  status: "todo" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: Date;
}

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
  status: "complete" | "in-progress" | "pending";
  tasks: number;
}

const sections: Section[] = [
  { id: "executive-summary", title: "Executive Summary", icon: <BookOpen className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "architecture", title: "Architecture Overview", icon: <Layers className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "tech-stack", title: "Technology Stack", icon: <Code className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "project-structure", title: "Project Structure", icon: <FileText className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "data-models", title: "Data Models", icon: <Database className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "ui-components", title: "UI Components", icon: <Layers className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "user-flows", title: "User Flows", icon: <Users className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "api-integration", title: "API Integration", icon: <Code className="h-4 w-4" />, status: "in-progress", tasks: 2 },
  { id: "database", title: "Database Schema", icon: <Database className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "features", title: "Features Specification", icon: <Settings className="h-4 w-4" />, status: "in-progress", tasks: 3 },
  { id: "export-formats", title: "Export Formats", icon: <Download className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "accessibility", title: "Accessibility", icon: <Users className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "security", title: "Security", icon: <AlertCircle className="h-4 w-4" />, status: "pending", tasks: 1 },
  { id: "dependencies", title: "Dependencies", icon: <Code className="h-4 w-4" />, status: "complete", tasks: 0 },
  { id: "changelog", title: "Changelog", icon: <Clock className="h-4 w-4" />, status: "in-progress", tasks: 0 },
];

const Specification = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [specContent, setSpecContent] = useState(SPECIFICATION_CONTENT);
  const [editedContent, setEditedContent] = useState(SPECIFICATION_CONTENT);
  const [tasks, setTasks] = useState<DevTask[]>([
    {
      id: "1",
      title: "Implement webhook retry logic",
      description: "Add exponential backoff for failed webhook deliveries",
      section: "api-integration",
      status: "todo",
      priority: "high",
      createdAt: new Date(),
    },
    {
      id: "2",
      title: "Add rate limiting",
      description: "Implement rate limiting for API endpoints",
      section: "api-integration",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date(),
    },
    {
      id: "3",
      title: "Form field validation",
      description: "Add validation for all form field types",
      section: "features",
      status: "todo",
      priority: "medium",
      createdAt: new Date(),
    },
    {
      id: "4",
      title: "Drawing tool persistence",
      description: "Save drawing paths to template",
      section: "features",
      status: "completed",
      priority: "high",
      createdAt: new Date(),
    },
    {
      id: "5",
      title: "Multi-select element operations",
      description: "Allow bulk operations on selected elements",
      section: "features",
      status: "in-progress",
      priority: "medium",
      createdAt: new Date(),
    },
    {
      id: "6",
      title: "RLS policy review",
      description: "Review and tighten RLS policies for production",
      section: "security",
      status: "blocked",
      priority: "critical",
      createdAt: new Date(),
    },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("features");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const getStatusIcon = (status: Section["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "pending":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTaskStatusColor = (status: DevTask["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in-progress":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "blocked":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground border-muted";
    }
  };

  const getPriorityColor = (priority: DevTask["priority"]) => {
    switch (priority) {
      case "critical":
        return "bg-red-500/10 text-red-500";
      case "high":
        return "bg-orange-500/10 text-orange-500";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const handleSave = () => {
    setSpecContent(editedContent);
    setIsEditing(false);
    toast.success("Specification saved successfully");
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    
    const newTask: DevTask = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: "",
      section: newTaskSection,
      status: "todo",
      priority: "medium",
      createdAt: new Date(),
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskTitle("");
    toast.success("Task added");
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const statusOrder: DevTask["status"][] = ["todo", "in-progress", "completed", "blocked"];
        const currentIndex = statusOrder.indexOf(task.status);
        const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
        return { ...task, status: nextStatus };
      }
      return task;
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success("Task deleted");
  };

  const exportSpec = () => {
    const blob = new Blob([specContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SPECIFICATION.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Specification exported");
  };

  const filteredTasks = selectedSection
    ? tasks.filter(task => task.section === selectedSection)
    : tasks;

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === "completed").length,
    inProgress: tasks.filter(t => t.status === "in-progress").length,
    blocked: tasks.filter(t => t.status === "blocked").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Specification Manager</h1>
            </div>
            <Badge variant="outline" className="ml-2">v1.0.0</Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportSpec}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{taskStats.total}</div>
              <p className="text-sm text-muted-foreground">Total Tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-500">{taskStats.completed}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-500">{taskStats.inProgress}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-500">{taskStats.blocked}</div>
              <p className="text-sm text-muted-foreground">Blocked</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="tasks">Dev Tasks</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sections Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Specification Sections</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-2">
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors hover:bg-accent/50 ${
                            selectedSection === section.id ? "bg-accent border-primary" : ""
                          }`}
                          onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                        >
                          <div className="flex items-center gap-3">
                            {section.icon}
                            <span className="font-medium">{section.title}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {section.tasks > 0 && (
                              <Badge variant="secondary">{section.tasks} tasks</Badge>
                            )}
                            {getStatusIcon(section.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Active Tasks */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedSection 
                      ? `Tasks: ${sections.find(s => s.id === selectedSection)?.title}`
                      : "All Active Tasks"
                    }
                  </CardTitle>
                  {selectedSection && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedSection(null)}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Show All
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-3">
                      {filteredTasks.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          No tasks found
                        </p>
                      ) : (
                        filteredTasks.map((task) => (
                          <div
                            key={task.id}
                            className="p-3 rounded-lg border space-y-2"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-2">
                                <Checkbox
                                  checked={task.status === "completed"}
                                  onCheckedChange={() => toggleTaskStatus(task.id)}
                                />
                                <div>
                                  <p className={`font-medium ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}>
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 pl-6">
                              <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                              <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Document Tab */}
          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle>SPECIFICATION.md</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="min-h-[600px] font-mono text-sm"
                    placeholder="Enter specification content..."
                  />
                ) : (
                  <ScrollArea className="h-[600px]">
                    <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-muted rounded-lg">
                      {specContent}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            {/* Add Task Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Task</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Task title..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                    className="flex-1"
                  />
                  <select
                    value={newTaskSection}
                    onChange={(e) => setNewTaskSection(e.target.value)}
                    className="px-3 py-2 border rounded-md bg-background"
                  >
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.title}
                      </option>
                    ))}
                  </select>
                  <Button onClick={handleAddTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* All Tasks by Section */}
            <div className="space-y-4">
              {sections.map((section) => {
                const sectionTasks = tasks.filter(t => t.section === section.id);
                if (sectionTasks.length === 0) return null;
                
                return (
                  <Collapsible key={section.id} defaultOpen>
                    <Card>
                      <CollapsibleTrigger className="w-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                          <div className="flex items-center gap-2">
                            {section.icon}
                            <CardTitle className="text-base">{section.title}</CardTitle>
                            <Badge variant="secondary">{sectionTasks.length}</Badge>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-2">
                            {sectionTasks.map((task) => (
                              <div
                                key={task.id}
                                className="flex items-center justify-between p-3 rounded-lg border"
                              >
                                <div className="flex items-center gap-3">
                                  <Checkbox
                                    checked={task.status === "completed"}
                                    onCheckedChange={() => toggleTaskStatus(task.id)}
                                  />
                                  <span className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>
                                    {task.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={getTaskStatusColor(task.status)}>
                                    {task.status}
                                  </Badge>
                                  <Badge variant="secondary" className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteTask(task.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Specification;
