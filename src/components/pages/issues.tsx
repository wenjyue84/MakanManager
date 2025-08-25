"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  AlertCircle,
  Camera,
  Eye,
  User,
  Calendar,
  Shield,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  X,
  FileText,
  Link
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { currentUser } from '../../lib/data';
import { staffMembers } from '../../lib/staff-data';
import { managementBudgets } from '../../lib/data';
import { 
  issues,
  getCategoryDefaultPoints,
  getStatusColor,
  formatDateTime,
  type Issue 
} from '../../lib/operations-data';
import { Station } from '../../lib/types';
import { toast } from 'sonner';

export function IssuesPage() {
  const [activeTab, setActiveTab] = useState<Issue['status']>('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: 'complaint' as Issue['category'],
    station: 'kitchen' as Station,
    description: '',
    targetStaff: '',
    photo: '',
    defaultPoints: -50
  });

  // Approval state
  const [approvalData, setApprovalData] = useState({
    managerExtra: 0,
    ownerExtra: 0,
    newStatus: 'resolved' as Issue['status']
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const isOwner = currentUser.roles.includes('owner');

  // Get current user's daily budget
  const currentBudget = managementBudgets.get(currentUser.id) || 500;

  // Filter issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (issue.status !== activeTab) return false;
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !issue.issueNumber.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'all' && issue.category !== selectedCategory) return false;
      if (selectedStation !== 'all' && issue.station !== selectedStation) return false;
      return true;
    });
  }, [activeTab, searchQuery, selectedCategory, selectedStation]);

  // Count by status
  const statusCounts = useMemo(() => {
    return {
      open: issues.filter(i => i.status === 'open').length,
      investigating: issues.filter(i => i.status === 'investigating').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      dismissed: issues.filter(i => i.status === 'dismissed').length
    };
  }, []);

  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  const handleCreateIssue = () => {
    setFormData({
      title: '',
      category: 'complaint',
      station: 'kitchen',
      description: '',
      targetStaff: '',
      photo: '',
      defaultPoints: -50
    });
    setIsCreateOpen(true);
  };

  const handleCategoryChange = (category: Issue['category']) => {
    const defaultPoints = getCategoryDefaultPoints(category);
    setFormData(prev => ({ ...prev, category, defaultPoints }));
  };

  const handleSaveIssue = () => {
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Issue created successfully');
    setIsCreateOpen(false);
  };

  const handleApproveIssue = () => {
    if (!selectedIssue) return;

    const totalExtra = Math.abs(approvalData.managerExtra) + Math.abs(approvalData.ownerExtra);
    
    if (totalExtra > currentBudget) {
      toast.error(`Insufficient budget. You have RM${currentBudget} remaining today.`);
      return;
    }

    const totalPoints = selectedIssue.defaultPoints + approvalData.managerExtra + approvalData.ownerExtra;
    
    toast.success(`Issue ${approvalData.newStatus}. ${Math.abs(totalPoints)} points applied.`);
    setIsApprovalOpen(false);
    setIsDetailOpen(false);
  };

  const handleStatusChange = (status: Issue['status']) => {
    if (!selectedIssue) return;
    
    toast.success(`Issue status changed to ${status}`);
  };

  const handleCreateFollowupTask = () => {
    toast.info('Redirecting to create task with prefilled details...');
  };

  const handlePhotoUpload = () => {
    toast.info('Photo upload feature coming soon!');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStation('all');
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'complaint': return 'destructive';
      case 'hygiene': return 'destructive';
      case 'wastage': return 'warning';
      case 'recipe': return 'warning';
      case 'disciplinary': return 'destructive';
      case 'stock-out': return 'warning';
      default: return 'secondary';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'complaint': return 'Complaint';
      case 'hygiene': return 'Hygiene';
      case 'wastage': return 'Wastage';
      case 'recipe': return 'Recipe';
      case 'disciplinary': return 'Disciplinary';
      case 'stock-out': return 'Stock-out';
      default: return category;
    }
  };

  // Mobile Card Component
  const IssueCard = ({ issue }: { issue: Issue }) => {
    const reportedBy = getUserById(issue.reportedBy);
    const targetStaff = issue.targetStaff ? getUserById(issue.targetStaff) : null;

    return (
      <Card className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedIssue(issue);
        setIsDetailOpen(true);
      }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">{issue.issueNumber}</Badge>
                  <Badge variant={getStatusColor(issue.status)} className="text-xs capitalize">
                    {issue.status.replace('-', ' ')}
                  </Badge>
                </div>
                <h4 className="font-medium">{issue.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getCategoryColor(issue.category)} className="text-xs">
                    {getCategoryLabel(issue.category)}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {issue.station}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-destructive">{issue.totalPoints}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-3 text-muted-foreground" />
                <span>Reported by {reportedBy?.name}</span>
              </div>
              {targetStaff && (
                <div className="flex items-center gap-2">
                  <Shield className="size-3 text-muted-foreground" />
                  <span>Target: {targetStaff.name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="size-3 text-muted-foreground" />
                <span>{formatDateTime(issue.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Row Component
  const IssueTableRow = ({ issue }: { issue: Issue }) => {
    const reportedBy = getUserById(issue.reportedBy);
    const targetStaff = issue.targetStaff ? getUserById(issue.targetStaff) : null;

    return (
      <TableRow className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedIssue(issue);
        setIsDetailOpen(true);
      }}>
        <TableCell>
          <Badge variant="outline">{issue.issueNumber}</Badge>
        </TableCell>
        <TableCell>
          <div className="font-medium">{issue.title}</div>
        </TableCell>
        <TableCell>
          <Badge variant={getCategoryColor(issue.category)}>
            {getCategoryLabel(issue.category)}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={reportedBy?.photo} />
              <AvatarFallback className="text-xs">{reportedBy?.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{reportedBy?.name}</span>
          </div>
        </TableCell>
        <TableCell>
          {targetStaff ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={targetStaff.photo} />
                <AvatarFallback className="text-xs">{targetStaff.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{targetStaff.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">—</span>
          )}
        </TableCell>
        <TableCell>
          <div className="text-sm">{formatDateTime(issue.createdAt)}</div>
        </TableCell>
        <TableCell>
          <Badge variant={getStatusColor(issue.status)} className="capitalize">
            {issue.status.replace('-', ' ')}
          </Badge>
        </TableCell>
        <TableCell>
          <span className="font-semibold text-destructive">{issue.totalPoints}</span>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline">
              <Eye className="size-3 mr-1" />
              View
            </Button>
            {isManagement && (issue.status === 'open' || issue.status === 'investigating') && (
              <Button
                size="sm"
                variant="default"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIssue(issue);
                  setApprovalData({
                    managerExtra: 0,
                    ownerExtra: 0,
                    newStatus: 'resolved'
                  });
                  setIsApprovalOpen(true);
                }}
              >
                Apply Points
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Issues</h1>
              <p className="text-muted-foreground">Track and manage operational issues</p>
            </div>
            
            <Button onClick={handleCreateIssue} className="flex items-center gap-2">
              <Plus className="size-4" />
              Report Issue
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="wastage">Wastage</SelectItem>
                    <SelectItem value="recipe">Recipe</SelectItem>
                    <SelectItem value="disciplinary">Disciplinary</SelectItem>
                    <SelectItem value="stock-out">Stock-out</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStation} onValueChange={setSelectedStation}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Station" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stations</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || selectedCategory !== 'all' || selectedStation !== 'all') && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Issue['status'])}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="open" className="relative">
              Open
              <Badge variant="secondary" className="ml-1 text-xs">
                {statusCounts.open}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="investigating" className="relative">
              Investigating
              <Badge variant="secondary" className="ml-1 text-xs">
                {statusCounts.investigating}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="resolved" className="relative">
              Resolved
              <Badge variant="secondary" className="ml-1 text-xs">
                {statusCounts.resolved}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="dismissed" className="relative">
              Dismissed
              <Badge variant="secondary" className="ml-1 text-xs">
                {statusCounts.dismissed}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {Object.keys(statusCounts).map((status) => (
            <TabsContent key={status} value={status} className="mt-6">
              {filteredIssues.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="size-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="text-muted-foreground">
                    No {status} issues found.
                  </div>
                </div>
              ) : (
                <>
                  {isMobile ? (
                    <div className="grid gap-4">
                      {filteredIssues.map((issue) => (
                        <IssueCard key={issue.id} issue={issue} />
                      ))}
                    </div>
                  ) : (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Reported by</TableHead>
                            <TableHead>Target Staff</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Default Points</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredIssues.map((issue) => (
                            <IssueTableRow key={issue.id} issue={issue} />
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create Issue Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Report Issue</DialogTitle>
            <DialogDescription>
              Log a problem that needs attention
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complaint">Complaint</SelectItem>
                    <SelectItem value="hygiene">Hygiene</SelectItem>
                    <SelectItem value="wastage">Wastage</SelectItem>
                    <SelectItem value="recipe">Recipe</SelectItem>
                    <SelectItem value="disciplinary">Disciplinary</SelectItem>
                    <SelectItem value="stock-out">Stock-out</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Station *</Label>
                <Select value={formData.station} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, station: value as Station }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                    <SelectItem value="front">Front</SelectItem>
                    <SelectItem value="store">Store</SelectItem>
                    <SelectItem value="outdoor">Outdoor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue..."
                className="mt-1"
                rows={4}
              />
            </div>

            <div>
              <Label>Target Staff (Optional)</Label>
              <Select value={formData.targetStaff} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, targetStaff: value }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {staffMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                The person whose action caused the issue (for point deduction)
              </p>
            </div>

            <div>
              <Label>Default Points</Label>
              <div className="mt-1">
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  <span className="font-semibold text-destructive">{formData.defaultPoints}</span>
                  <span className="text-sm text-muted-foreground">
                    (Auto-filled based on category)
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Label>Photo / Attachment</Label>
              <div className="mt-1">
                <Button onClick={handlePhotoUpload} variant="outline" className="w-full">
                  <Camera className="size-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Photo evidence is encouraged but optional
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveIssue}>
              Submit Issue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedIssue && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Badge variant="outline">{selectedIssue.issueNumber}</Badge>
                  {selectedIssue.title}
                </DialogTitle>
                <DialogDescription>
                  {getCategoryLabel(selectedIssue.category)} • {selectedIssue.station} • {formatDateTime(selectedIssue.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Description</Label>
                      <p className="mt-1">{selectedIssue.description}</p>
                    </div>

                    {selectedIssue.photo && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Photo Evidence</Label>
                        <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted mt-1">
                          <img src={selectedIssue.photo} alt="Issue evidence" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Reported by</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="size-6">
                            <AvatarImage src={getUserById(selectedIssue.reportedBy)?.photo} />
                            <AvatarFallback className="text-xs">
                              {getUserById(selectedIssue.reportedBy)?.name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getUserById(selectedIssue.reportedBy)?.name}</span>
                        </div>
                      </div>

                      {selectedIssue.targetStaff && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Target Staff</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="size-6">
                              <AvatarImage src={getUserById(selectedIssue.targetStaff)?.photo} />
                              <AvatarFallback className="text-xs">
                                {getUserById(selectedIssue.targetStaff)?.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            <span>{getUserById(selectedIssue.targetStaff)?.name}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Points Panel */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Points Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span>Default Points:</span>
                          <span className="font-semibold">{selectedIssue.defaultPoints}</span>
                        </div>
                        {selectedIssue.managerExtra !== 0 && (
                          <div className="flex justify-between">
                            <span>Manager Extra:</span>
                            <span className="font-semibold">{selectedIssue.managerExtra > 0 ? '+' : ''}{selectedIssue.managerExtra}</span>
                          </div>
                        )}
                        {selectedIssue.ownerExtra !== 0 && (
                          <div className="flex justify-between">
                            <span>Owner Extra:</span>
                            <span className="font-semibold">{selectedIssue.ownerExtra > 0 ? '+' : ''}{selectedIssue.ownerExtra}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span>Total:</span>
                          <span className="font-bold text-destructive">{selectedIssue.totalPoints}</span>
                        </div>
                        
                        {isManagement && (
                          <div className="space-y-2 mt-4">
                            <Label className="text-sm">Your Daily Budget</Label>
                            <Progress value={(currentBudget / 500) * 100} className="h-2" />
                            <div className="text-xs text-muted-foreground">
                              RM{currentBudget} / RM500 remaining today
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {selectedIssue.status !== 'resolved' && selectedIssue.status !== 'dismissed' && (
                      <div className="space-y-2">
                        <Label>Status Actions</Label>
                        <div className="space-y-2">
                          <Button 
                            onClick={() => handleStatusChange('investigating')}
                            variant="outline" 
                            size="sm" 
                            className="w-full"
                          >
                            Mark as Investigating
                          </Button>
                          {isManagement && (
                            <>
                              <Button 
                                onClick={() => {
                                  setApprovalData({
                                    managerExtra: 0,
                                    ownerExtra: 0,
                                    newStatus: 'resolved'
                                  });
                                  setIsApprovalOpen(true);
                                }}
                                variant="default" 
                                size="sm" 
                                className="w-full"
                              >
                                Apply Points & Resolve
                              </Button>
                              <Button 
                                onClick={() => handleStatusChange('dismissed')}
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                              >
                                Dismiss Issue
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    <Button 
                      onClick={handleCreateFollowupTask}
                      variant="outline" 
                      size="sm" 
                      className="w-full flex items-center gap-2"
                    >
                      <Link className="size-4" />
                      Create Follow-up Task
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Points Approval Dialog */}
      <Dialog open={isApprovalOpen} onOpenChange={setIsApprovalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply Points</DialogTitle>
            <DialogDescription>
              Adjust points and resolve the issue
            </DialogDescription>
          </DialogHeader>

          {selectedIssue && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Default Points:</span>
                  <span className="font-semibold">{selectedIssue.defaultPoints}</span>
                </div>

                <div>
                  <Label className="text-sm">Manager Extra (±10-50)</Label>
                  <Input
                    type="number"
                    value={approvalData.managerExtra}
                    onChange={(e) => setApprovalData(prev => ({ 
                      ...prev, 
                      managerExtra: Math.max(-50, Math.min(50, parseInt(e.target.value) || 0))
                    }))}
                    min="-50"
                    max="50"
                    className="mt-1"
                  />
                </div>

                {isOwner && (
                  <div>
                    <Label className="text-sm">Owner Extra (±10-100)</Label>
                    <Input
                      type="number"
                      value={approvalData.ownerExtra}
                      onChange={(e) => setApprovalData(prev => ({ 
                        ...prev, 
                        ownerExtra: Math.max(-100, Math.min(100, parseInt(e.target.value) || 0))
                      }))}
                      min="-100"
                      max="100"
                      className="mt-1"
                    />
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg">
                  <span>Total Points:</span>
                  <span className="font-bold text-destructive">
                    {selectedIssue.defaultPoints + approvalData.managerExtra + approvalData.ownerExtra}
                  </span>
                </div>

                <div>
                  <Label className="text-sm">New Status</Label>
                  <Select value={approvalData.newStatus} onValueChange={(value) => 
                    setApprovalData(prev => ({ ...prev, newStatus: value as Issue['status'] }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="dismissed">Dismissed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Your Daily Budget</Label>
                  <Progress value={(currentBudget / 500) * 100} className="h-2" />
                  <div className="text-xs text-muted-foreground">
                    RM{currentBudget} / RM500 remaining today
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApprovalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApproveIssue}>
              Apply Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}