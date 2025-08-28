"use client";

import React, { useState, useEffect } from "react";
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
import { ProfilePage } from "./components/pages/profile-page";
import { TaskDetailModal } from "./components/modals/task-detail-modal";
import { TaskCreateModal } from "./components/modals/task-create-modal";
import { TaskManagementDemo } from "./components/pages/task-management-demo";
import { DisciplinePage } from "./components/pages/discipline";
import { Task } from "./lib/types";
import { users } from "./lib/data";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { TasksDatabaseService } from "./lib/services/tasks-database.service";

function AppContent() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        console.log('Fetching tasks from database...');
        // Use database service instead of mock service
        const tasksDatabaseService = new TasksDatabaseService();
        const data = await tasksDatabaseService.getAllTasks();
        console.log('Tasks loaded successfully from database:', data);
        setTasks(data);
        setError(null); // Clear any previous errors
      } catch (err:any) {
        console.error('Error fetching tasks from database:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskUpdate = async (
    taskId: string,
    updates: Partial<Task>,
  ) => {
    try {
      const tasksDatabaseService = new TasksDatabaseService();
      const updatedTask = await tasksDatabaseService.updateTask(taskId, updates);
      
      if (updatedTask) {
        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId ? updatedTask : task,
          ),
        );
      }

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
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error("Failed to update task");
    }
  };

  const handleCreateTask = () => {
    setIsCreateTaskModalOpen(true);
  };

  const handleTaskCreate = async (
    taskData: Omit<Task, "id" | "createdAt" | "overdueDays">
  ) => {
    try {
      const tasksDatabaseService = new TasksDatabaseService();
      const newTask = await tasksDatabaseService.createTask(taskData);
      setTasks(prev => [newTask, ...prev]);
      toast.success("Task created successfully in database!");
      setIsCreateTaskModalOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error("Failed to create task in database");
    }
  };

  const handleCreateDiscipline = () => {
    navigate('/discipline');
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
                      loading={isLoading}
                      error={error}
                      onTaskClick={handleTaskClick}
                      onTaskUpdate={handleTaskUpdate}
                      onCreateTask={handleCreateTask}
                      onCreateDiscipline={handleCreateDiscipline}
                      currentLanguage="en"
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
                <Route path="/discipline" element={<DisciplinePage />} />
                <Route path="/purchase-list" element={<PurchaseListPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/suppliers" element={<SuppliersPage />} />
                <Route path="/salary" element={<SalaryPage />} />
                <Route path="/online-orders" element={<OnlineOrdersPage />} />
                <Route path="/cash" element={<CashPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
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
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <AppContent />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}