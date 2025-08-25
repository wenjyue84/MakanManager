"use client";

import React, { useState } from "react";
import { EnhancedAppLayout } from "./components/layout/enhanced-app-layout";
import { Dashboard } from "./components/pages/dashboard";
import { Tasks } from "./components/pages/tasks";
import { Leaderboard } from "./components/pages/leaderboard";
import { Staff } from "./components/pages/staff";
import { Recipes } from "./components/pages/recipes";
import { StaffMealPage } from "./components/pages/staff-meal";
import { DisposalPage } from "./components/pages/disposal";
import { IssuesPage } from "./components/pages/issues";
import { PurchaseListPage } from "./components/pages/purchase-list";
import { SkillsPage } from "./components/pages/skills";
import { SuppliersPage } from "./components/pages/suppliers";
import { SalaryPage } from "./components/pages/salary";
import { OnlineOrdersPage } from "./components/pages/online-orders";
import { CashPage } from "./components/pages/cash";
import { ReportsPage } from "./components/pages/reports";
import { TaskDetailModal } from "./components/modals/task-detail-modal";
import { Task, Language } from "./lib/types";
import {
  tasks as initialTasks,
  currentUser,
  users,
} from "./lib/data";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

export default function App() {
  const [currentPage, setCurrentPage] =
    useState("dashboard"); // Changed back to dashboard to show the enhanced navigation
  const [currentLanguage, setCurrentLanguage] =
    useState<Language>("en");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(
    null,
  );
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = (
    taskId: string,
    updates: Partial<Task>,
  ) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task,
      ),
    );

    // Show appropriate toast based on update
    if (
      updates.status === "in-progress" &&
      updates.assigneeId
    ) {
      toast.success("Task claimed successfully!");
    } else if (updates.status === "pending-review") {
      toast.success("Task submitted for review!");
    } else if (updates.status === "done") {
      toast.success("Task approved! Points awarded.");
    } else if (updates.status === "on-hold") {
      toast.info("Task put on hold. SLA paused.");
    } else if (
      updates.status === "in-progress" &&
      updates.rejectionReason
    ) {
      toast.error("Task rejected. Please check feedback.");
    } else if (updates.rejectionReason) {
      toast.error("Task rejected. Please check feedback.");
    }

    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  const handleCreateTask = () => {
    toast.info("Create Task feature coming soon!");
  };

  const handleCreateDiscipline = () => {
    toast.info(
      "Create Disciplinary Action feature coming soon!",
    );
  };

  const handleAdminClick = () => {
    setCurrentPage("admin");
    toast.info(
      "Navigating to Admin settings for rewards configuration",
    );
  };

  const handleProfileClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    toast.info(`Opening staff profile for ${user?.name}`);
    // In a real app, this would navigate to the staff profile page
  };

  const handleDisciplineClick = () => {
    setCurrentPage("discipline");
    toast.info("Navigating to Disciplinary Actions");
  };

  const handleUserChange = (userId: string) => {
    const newUser = users.find((u) => u.id === userId);
    if (newUser) {
      // Update the current user object
      Object.assign(currentUser, newUser);

      // Show notification about the user switch
      const isStaff = newUser.roles.includes("staff");
      const isManagement = newUser.roles.some((role) =>
        [
          "owner",
          "manager",
          "head-of-kitchen",
          "front-desk-manager",
        ].includes(role),
      );

      if (isStaff) {
        toast.info(`Switched to Staff view: ${newUser.name}`, {
          description:
            "Can perform cash reconciliation and view own records only.",
        });
      } else if (isManagement) {
        toast.info(
          `Switched to Management view: ${newUser.name}`,
          {
            description:
              "Full access: Approve cash reconciliations, view all records and analytics.",
          },
        );
      }

      // Force re-render by updating a state value
      setCurrentPage((prev) => prev);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <Dashboard
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            onCreateDiscipline={handleCreateDiscipline}
          />
        );
      case "online-orders":
        return <OnlineOrdersPage />;
      case "cash":
        return <CashPage />;
      case "tasks":
        return (
          <Tasks
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onTaskUpdate={handleTaskUpdate}
            onCreateTask={handleCreateTask}
            onCreateDiscipline={handleCreateDiscipline}
            currentLanguage={currentLanguage}
          />
        );
      case "leaderboard":
        return (
          <Leaderboard
            onAdminClick={handleAdminClick}
            onProfileClick={handleProfileClick}
          />
        );
      case "staff":
        return (
          <Staff onDisciplineClick={handleDisciplineClick} />
        );
      case "recipes":
        return <Recipes />;
      case "staff-meal":
        return <StaffMealPage />;
      case "disposal":
        return <DisposalPage />;
      case "issues":
        return <IssuesPage />;
      case "purchase-list":
        return <PurchaseListPage />;
      case "skills":
        return <SkillsPage />;
      case "suppliers":
        return <SuppliersPage />;
      case "salary":
        return <SalaryPage />;
      case "discipline":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Disciplinary Actions
            </h2>
            <p className="text-muted-foreground">
              Disciplinary management interface coming soon!
            </p>
            <button
              onClick={() => setCurrentPage("staff")}
              className="text-primary hover:underline"
            >
              ← Back to Staff Directory
            </button>
          </div>
        );
      case "reports":
        return <ReportsPage />;
      case "admin":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">
              Admin Settings
            </h2>
            <p className="text-muted-foreground">
              Rewards configuration and other admin settings
              coming soon!
            </p>
            <button
              onClick={() => setCurrentPage("leaderboard")}
              className="text-primary hover:underline"
            >
              ← Back to Leaderboard
            </button>
          </div>
        );
      default:
        return (
          <Dashboard
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            onCreateDiscipline={handleCreateDiscipline}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <EnhancedAppLayout
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onUserChange={handleUserChange}
      >
        {renderPage()}
      </EnhancedAppLayout>

      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onTaskUpdate={handleTaskUpdate}
      />

      <Toaster />
    </div>
  );
}