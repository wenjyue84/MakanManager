"use client";

import React, { useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import OrderFormPage from "./components/pages/order-form";
import { AuthProvider } from "./lib/contexts/auth-context";
import { LanguageProvider } from "./lib/contexts/language-context";
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
import { TaskCreateModal } from "./components/modals/task-create-modal";
import { TaskManagementDemo } from "./components/pages/task-management-demo";
import { Task } from "./lib/types";
import {
  tasks as initialTasks,
  users,
} from "./lib/data";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";

function AppContent() {
  const [tasks, setTasks] = useState(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);

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
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskCreate = (
    taskData: Omit<Task, "id" | "createdAt" | "overdueDays">
  ) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      overdueDays: 0,
    };
    setTasks((prev) => [newTask, ...prev]);
    toast.success("Task created successfully!");
  };

  const handleCreateDiscipline = () => {
    toast.info(
      "Create Disciplinary Action feature coming soon!",
    );
  };

  const handleNewOrder = () => toast.info("New Order feature coming soon!");
  const handleCashCount = () => toast.info("Cash Count feature coming soon!");
  const handleStaffMeal = () => toast.info("Staff Meal feature coming soon!");
  const handleReportIssue = () => {
    // Navigate to issues page
    window.location.hash = '#/issues';
  };
  const handleClockIn = () => toast.info("Clock In/Out feature coming soon!");
  const onRequestMeal = () => toast.info("Request Meal feature coming soon!");
  const onTakeBreak = () => toast.info("Take Break feature coming soon!");
  const onGetHelp = () => toast.info("Get Help feature coming soon!");

  const handleAdminClick = () => {
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



  return (
    <Router>
      <Routes>
        <Route path="/order-form" element={<OrderFormPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <EnhancedAppLayout onUserChange={handleUserChange}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route
                    path="/dashboard"
                    element={
                      <Dashboard
                        onTaskClick={handleTaskClick}
                        onCreateTask={handleCreateTask}
                        onCreateDiscipline={handleCreateDiscipline}
                        onNewOrder={handleNewOrder}
                        onCashCount={handleCashCount}
                        onStaffMeal={handleStaffMeal}
                        onReportIssue={handleReportIssue}
                        onClockIn={handleClockIn}
                        onRequestMeal={onRequestMeal}
                        onTakeBreak={onTakeBreak}
                        onGetHelp={onGetHelp}
                      />
                    }
                  />
                  <Route
                    path="/tasks"
                    element={
                      <Tasks
                        tasks={tasks}
                        onTaskClick={handleTaskClick}
                        onCreateTask={handleCreateTask}
                        onCreateDiscipline={handleCreateDiscipline}
                      />
                    }
                  />
                  <Route path="/task-management" element={<TaskManagementDemo />} />
                  <Route path="/leaderboard" element={<Leaderboard />} />
                  <Route path="/staff" element={<Staff onProfileClick={handleProfileClick} />} />
                  <Route path="/recipes" element={<Recipes />} />
                  <Route path="/staff-meal" element={<StaffMealPage />} />
                  <Route path="/disposal" element={<DisposalPage />} />
                  <Route path="/issues" element={<IssuesPage />} />
                  <Route path="/purchase-list" element={<PurchaseListPage />} />
                  <Route path="/skills" element={<SkillsPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/salary" element={<SalaryPage />} />
                  <Route path="/online-orders" element={<OnlineOrdersPage />} />
                  <Route path="/cash" element={<CashPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
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
            } />
            <Route path="/tasks" element={
              <Tasks
                tasks={tasks}
                onTaskClick={handleTaskClick}
                onCreateTask={handleCreateTask}
                onCreateDiscipline={handleCreateDiscipline}
              />
            } />
            <Route path="/task-management" element={<TaskManagementDemo />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/staff" element={<Staff onProfileClick={handleProfileClick} />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/staff-meal" element={<StaffMealPage />} />
            <Route path="/disposal" element={<DisposalPage />} />
            <Route path="/issues" element={<IssuesPage />} />
            <Route path="/purchase-list" element={<PurchaseListPage />} />
            <Route path="/skills" element={<SkillsPage />} />
            <Route path="/suppliers" element={<SuppliersPage />} />
            <Route path="/salary" element={<SalaryPage />} />
            <Route path="/online-orders" element={<OnlineOrdersPage />} />
            <Route path="/cash" element={<CashPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </EnhancedAppLayout>

        <TaskCreateModal
          isOpen={isCreateTaskModalOpen}
          onClose={() => setIsCreateTaskModalOpen(false)}
          onCreateTask={handleTaskCreate}
        />

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
          }
        />
      </Routes>
    </Router>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </AuthProvider>
  );
}