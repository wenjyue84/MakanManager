"use client";

import React, { useState } from "react";
import { AuthProvider } from "./lib/contexts/auth-context";
import { ProtectedRoute } from "./components/auth/protected-route";
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
import { TaskManagementDemo } from "./components/pages/task-management-demo";
import { Task, Language } from "./lib/types";
import {
  tasks as initialTasks,
  users,
} from "./lib/data";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

function AppContent() {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [currentLanguage, setCurrentLanguage] = useState<Language>("en");
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
  };

  const handleUserChange = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      toast.success(`Switched to ${user.name}`);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return (
          <Tasks
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onCreateTask={handleCreateTask}
            onCreateDiscipline={handleCreateDiscipline}
          />
        );
      case "task-management":
        return <TaskManagementDemo />;
      case "leaderboard":
        return <Leaderboard />;
      case "staff":
        return <Staff onProfileClick={handleProfileClick} />;
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
      case "online-orders":
        return <OnlineOrdersPage />;
      case "cash":
        return <CashPage />;
      case "reports":
        return <ReportsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
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
        onUpdate={handleTaskUpdate}
      />

      <Toaster />
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}