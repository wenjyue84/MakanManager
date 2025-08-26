"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Plus, 
  User,
  Edit,
  Eye,
  MoreHorizontal,
  Upload,
  FileText,
  Calendar,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  Trophy,
  X,
  Camera,
  Users,
  MapPin,
  Key,
  Settings,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import { useCurrentUser } from '../../lib/hooks/use-current-user';
import {
  staffMembers,
  getStaffMemberById,
  updateStaffMember,
  addStaffMember,
  deleteStaffMember,
  getRoleDisplayName,
  getLanguageDisplayName,
  type StaffMember
} from '../../lib/staff-data';
import { UserRole, Station } from '../../lib/types';
import { toast } from 'sonner';

interface StaffProps {
  onDisciplineClick?: () => void;
}

export function Staff({ onDisciplineClick }: StaffProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
  const initialAddForm: Partial<StaffMember> = {
    name: '',
    roles: ['staff'],
    gender: 'male',
    phone: '',
    startDate: new Date().toISOString().split('T')[0],
    emergencyContact: { name: '', phone: '' },
    status: 'active',
    photo: '',
    pointsThisMonth: 0,
    pointsYTD: 0,
    completedTasks: 0,
    disciplinaryCount: 0,
    documents: []
  };
  const [addForm, setAddForm] = useState<Partial<StaffMember>>(initialAddForm);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { user: currentUser, isLoading } = useCurrentUser();

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading || !currentUser) {
    return <div>Loading...</div>;
  }

  const isManagement = currentUser.roles.some(role =>
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  // Filter staff based on search and filters
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(member => {
      if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedRole !== 'all') {
        if (selectedRole === 'management' && !member.roles.some(role => 
          ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
        )) return false;
        if (selectedRole !== 'management' && !member.roles.includes(selectedRole as UserRole)) return false;
      }
      if (selectedGender !== 'all' && member.gender !== selectedGender) return false;
      if (selectedStatus !== 'all' && member.status !== selectedStatus) return false;
      if (selectedStation !== 'all' && member.station !== selectedStation) return false;
      return true;
    });
  }, [searchQuery, selectedRole, selectedGender, selectedStatus, selectedStation]);

  const handleExportCSV = () => {
    toast.success('CSV export completed', {
      description: 'Staff directory has been exported successfully'
    });
  };

  const handleAddStaff = () => {
    setIsAddStaffOpen(true);
  };

  const handleCreateStaff = () => {
    const requiredFields = ['name', 'phone', 'startDate', 'emergencyContact'];
    const missing = requiredFields.filter(field => {
      if (field === 'emergencyContact') {
        return !addForm.emergencyContact?.name || !addForm.emergencyContact?.phone;
      }
      return !addForm[field as keyof StaffMember];
    });

    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newId = (
      Math.max(0, ...staffMembers.map(m => parseInt(m.id, 10))) + 1
    ).toString();

    const newMember: StaffMember = {
      id: newId,
      name: addForm.name!,
      roles: (addForm.roles as UserRole[]) || ['staff'],
      gender: addForm.gender as 'male' | 'female',
      phone: addForm.phone!,
      email: addForm.email,
      startDate: addForm.startDate!,
      emergencyContact: addForm.emergencyContact as { name: string; phone: string },
      station: addForm.station as Station | undefined,
      status: (addForm.status as 'active' | 'inactive') || 'active',
      photo: addForm.photo || '',
      languages: addForm.languages,
      pointsThisMonth: addForm.pointsThisMonth || 0,
      pointsYTD: addForm.pointsYTD || 0,
      completedTasks: addForm.completedTasks || 0,
      disciplinaryCount: addForm.disciplinaryCount || 0,
      documents: []
    };

    addStaffMember(newMember);
    setIsAddStaffOpen(false);
    setAddForm(initialAddForm);
    toast.success('Staff added successfully');
  };

  const handleDeleteStaff = () => {
    if (!selectedStaff) return;
    const success = deleteStaffMember(selectedStaff.id);
    if (success) {
      toast.success('Staff deleted successfully');
    } else {
      toast.error('Failed to delete staff member');
    }
    setIsDeleteDialogOpen(false);
    setSelectedStaff(null);
  };

  const handleViewProfile = (member: StaffMember) => {
    setSelectedStaff(member);
    setIsProfileOpen(true);
    setIsEditing(false);
    setEditForm({});
  };

  const handleEditProfile = (member: StaffMember) => {
    const canEdit = isManagement || member.id === currentUser.id;
    if (!canEdit) {
      toast.error('You can only edit your own profile');
      return;
    }
    
    setSelectedStaff(member);
    setEditForm(member);
    setIsEditing(true);
    setIsProfileOpen(true);
  };

  const handleSaveProfile = () => {
    if (!selectedStaff || !editForm) return;
    
    // Validate required fields
    const requiredFields = ['name', 'phone', 'startDate', 'emergencyContact'];
    const missing = requiredFields.filter(field => {
      if (field === 'emergencyContact') {
        return !editForm.emergencyContact?.name || !editForm.emergencyContact?.phone;
      }
      return !editForm[field as keyof StaffMember];
    });
    
    if (missing.length > 0) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    // Check if staff can edit roles/status
    const isOwnProfile = selectedStaff.id === currentUser.id;
    const finalForm = { ...editForm };
    
    if (isOwnProfile && !isManagement) {
      // Staff can't change their own roles or status
      delete finalForm.roles;
      delete finalForm.status;
    }
    
    // Update the staff member
    updateStaffMember(selectedStaff.id, finalForm);
    
    // Update local state
    setSelectedStaff({ ...selectedStaff, ...finalForm });
    setIsEditing(false);
    setEditForm({});
    
    toast.success('Profile updated successfully');
  };

  const handleResetPassword = () => {
    if (!selectedStaff) return;
    
    toast.success('Password reset link sent', {
      description: `A password reset link has been sent to ${selectedStaff.name}`
    });
    setIsResetPasswordOpen(false);
  };

  const handleFileUpload = (type: 'photo' | 'document') => {
    toast.info(`${type === 'photo' ? 'Photo' : 'Document'} upload feature coming soon!`);
  };

  const handleDocumentDelete = (docId: string) => {
    toast.success('Document deleted successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedGender('all');
    setSelectedStatus('all');
    setSelectedStation('all');
  };

  const canEditMember = (member: StaffMember) => {
    return isManagement || member.id === currentUser.id;
  };

  const hasRequiredPhoto = (member: StaffMember) => {
    return member.photo && member.photo.trim() !== '';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Staff</h1>
              <p className="text-muted-foreground">Welcome back, {currentUser.name}</p>
            </div>
            
            {isManagement && (
              <div className="flex gap-2">
                <Button onClick={handleAddStaff} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Add Staff
                </Button>
                <Button onClick={handleExportCSV} variant="outline" className="flex items-center gap-2">
                  <Download className="size-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="head-of-kitchen">HoK</SelectItem>
                    <SelectItem value="front-desk-manager">FDM</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedGender} onValueChange={setSelectedGender}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
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

                {(searchQuery || selectedRole !== 'all' || selectedGender !== 'all' || selectedStatus !== 'all' || selectedStation !== 'all') && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Staff Directory */}
        <div>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">
                No staff match your filters.
              </div>
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role(s)</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
      <TableCell>
          <Avatar className="size-8">
            <AvatarImage src={member.photo} />
            <AvatarFallback>{member.name[0]}</AvatarFallback>
          </Avatar>
      </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
      <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {member.roles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {getRoleDisplayName([role])}
                          </Badge>
                        ))}
                      </div>
      </TableCell>
                    <TableCell className="capitalize">{member.gender}</TableCell>
      <TableCell>{member.phone}</TableCell>
      <TableCell>{formatDate(member.startDate)}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {member.status}
        </Badge>
      </TableCell>
                    <TableCell className="capitalize">{member.station || '—'}</TableCell>
      <TableCell>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewProfile(member)}>
                    <Eye className="size-4 mr-2" />
                    View Profile
                </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditProfile(member)}>
                    <Edit className="size-4 mr-2" />
                    Edit
                </DropdownMenuItem>
                  {isManagement && (
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedStaff(member);
                        setIsDeleteDialogOpen(true);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
              </DropdownMenuContent>
            </DropdownMenu>
      </TableCell>
    </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
          )}
      </div>

      {/* Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedStaff && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="size-12">
                    <AvatarImage src={selectedStaff.photo} />
                    <AvatarFallback>{selectedStaff.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl">{selectedStaff.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {getRoleDisplayName(selectedStaff.roles)}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              {!hasRequiredPhoto(selectedStaff) && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" />
                  <AlertDescription>
                    Profile photo required. Please upload a photo to complete the profile.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                {/* Summary Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Summary
                      {canEditMember(selectedStaff) && !isEditing && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProfile(selectedStaff)}
                        >
                          <Edit className="size-4 mr-1" />
                          Edit Profile
                        </Button>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-16">
                            <AvatarImage src={selectedStaff.photo} />
                            <AvatarFallback>{selectedStaff.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{selectedStaff.name}</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {selectedStaff.roles.map(role => (
                                <Badge key={role} variant="outline" className="text-xs">
                                  {getRoleDisplayName([role])}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Gender</div>
                            <div className="capitalize">{selectedStaff.gender}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Status</div>
                            <Badge variant={selectedStaff.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                              {selectedStaff.status}
                            </Badge>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Station</div>
                            <div className="capitalize">{selectedStaff.station || '—'}</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Languages</div>
                            <div className="flex flex-wrap gap-1">
                              {selectedStaff.languages?.map(lang => (
                                <Badge key={lang} variant="secondary" className="text-xs">
                                  {getLanguageDisplayName(lang)}
                                </Badge>
                              )) || '—'}
                            </div>
                          </div>
                        </div>
                      </div>
                  </CardContent>
                </Card>

                {/* Details Card */}
                      <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex items-center gap-2">
                                <Phone className="size-4 text-muted-foreground" />
                                <span>{selectedStaff.phone}</span>
                              </div>

                              {selectedStaff.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="size-4 text-muted-foreground" />
                                  <span>{selectedStaff.email}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <Calendar className="size-4 text-muted-foreground" />
                                <span>Started {formatDate(selectedStaff.startDate)}</span>
                              </div>

                              <div>
                                <div className="text-sm text-muted-foreground mb-1">Emergency Contact</div>
                                <div>{selectedStaff.emergencyContact.name}</div>
                                <div className="text-sm text-muted-foreground">{selectedStaff.emergencyContact.phone}</div>
                              </div>

                              {isManagement && (
                                <Button 
                                  onClick={() => {
                                    setSelectedStaff(selectedStaff);
                                    setIsResetPasswordOpen(true);
                                  }}
                                  variant="outline" 
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Key className="size-4" />
                                  Reset Password
                                </Button>
                              )}
                            </div>
                        </CardContent>
                      </Card>
                              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={(open) => {
        setIsAddStaffOpen(open);
        if (!open) setAddForm(initialAddForm);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
            <DialogDescription>Enter new staff details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div>
              <Label>Name *</Label>
              <Input
                className="mt-1"
                value={addForm.name}
                onChange={(e) => setAddForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Gender *</Label>
                <Select
                  value={addForm.gender}
                  onValueChange={(value) =>
                    setAddForm(prev => ({ ...prev, gender: value as 'male' | 'female' }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role *</Label>
                <Select
                  value={addForm.roles?.[0]}
                  onValueChange={(value) =>
                    setAddForm(prev => ({ ...prev, roles: [value as UserRole] }))
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="head-of-kitchen">HoK</SelectItem>
                    <SelectItem value="front-desk-manager">FDM</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Phone *</Label>
              <Input
                className="mt-1"
                value={addForm.phone}
                onChange={(e) => setAddForm(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label>Start Date *</Label>
              <Input
                type="date"
                className="mt-1"
                value={addForm.startDate}
                onChange={(e) => setAddForm(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Emergency Contact Name *</Label>
                <Input
                  className="mt-1"
                  value={addForm.emergencyContact?.name}
                  onChange={(e) =>
                    setAddForm(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))
                  }
                />
              </div>
              <div>
                <Label>Emergency Contact Phone *</Label>
                <Input
                  className="mt-1"
                  value={addForm.emergencyContact?.phone}
                  onChange={(e) =>
                    setAddForm(prev => ({
                      ...prev,
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))
                  }
                />
              </div>
            </div>
            <div>
              <Label>Status *</Label>
              <Select
                value={addForm.status}
                onValueChange={(value) =>
                  setAddForm(prev => ({ ...prev, status: value as 'active' | 'inactive' }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Station</Label>
              <Select
                value={addForm.station}
                onValueChange={(value) =>
                  setAddForm(prev => ({ ...prev, station: value as Station }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select station" />
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddStaffOpen(false);
                setAddForm(initialAddForm);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateStaff}>Add Staff</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Staff</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedStaff?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteStaff}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Send a password reset link to {selectedStaff?.name}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword}>
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
