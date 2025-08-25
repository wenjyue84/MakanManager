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
import { currentUser } from '../../lib/data';
import { 
  staffMembers, 
  getStaffMemberById, 
  updateStaffMember, 
  getRoleDisplayName, 
  getLanguageDisplayName,
  type StaffMember 
} from '../../lib/staff-data';
import { UserRole, Station } from '../../lib/types';
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
import { currentUser } from '../../lib/data';
import { 
  staffMembers, 
  getStaffMemberById, 
  updateStaffMember, 
  getRoleDisplayName, 
  getLanguageDisplayName,
  type StaffMember 
} from '../../lib/staff-data';
import { UserRole, Station } from '../../lib/types';
import { toast } from "sonner@2.0.3";

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
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
  const [addForm, setAddForm] = useState<Partial<StaffMember>>({
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
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleSaveNewStaff = () => {
    // Validate required fields
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
    
    // Generate a new ID (in a real app, this would come from the backend)
    const newId = (Math.max(...staffMembers.map(m => parseInt(m.id)), 0) + 1).toString();
    
    // Create a new staff member
    const newStaff: StaffMember = {
      id: newId,
      name: addForm.name || '',
      roles: addForm.roles as UserRole[] || ['staff'],
      gender: addForm.gender as 'male' | 'female' || 'male',
      phone: addForm.phone || '',
      email: addForm.email || '',
      startDate: addForm.startDate || new Date().toISOString().split('T')[0],
      emergencyContact: {
        name: addForm.emergencyContact?.name || '',
        phone: addForm.emergencyContact?.phone || ''
      },
      station: addForm.station as Station,
      status: addForm.status as 'active' | 'inactive' || 'active',
      photo: addForm.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
      languages: addForm.languages,
      pointsThisMonth: addForm.pointsThisMonth || 0,
      pointsYTD: addForm.pointsYTD || 0,
      completedTasks: addForm.completedTasks || 0,
      disciplinaryCount: addForm.disciplinaryCount || 0,
      documents: addForm.documents || []
    };
    
    // In a real app, we would send this to the backend
    // For now, we'll just add it to the local array
    staffMembers.push(newStaff);
    
    toast.success('Staff member added successfully');
    setIsAddStaffOpen(false);
    
    // Reset form
    setAddForm({
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
    });
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
      finalForm.roles = selectedStaff.roles;
      finalForm.status = selectedStaff.status;
    }
    
    updateStaffMember(selectedStaff.id, finalForm);
    setSelectedStaff({ ...selectedStaff, ...finalForm });
    setIsEditing(false);
    
    toast.success('Profile updated successfully');
  };

  const handleDeleteStaff = (member: StaffMember) => {
    if (!isManagement) {
      toast.error('Only management can delete staff members');
      return;
    }
    
    // In a real app, we would send a delete request to the backend
    // For now, we'll just remove it from the local array
    const index = staffMembers.findIndex(m => m.id === member.id);
    if (index !== -1) {
      staffMembers.splice(index, 1);
      toast.success(`${member.name} has been removed from the system`);
    }
  };

  const handleStatusToggle = (member: StaffMember) => {
    if (!isManagement) {
      toast.error('Only management can change staff status');
      return;
    }
    
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    updateStaffMember(member.id, { status: newStatus });
    
    toast.success(`${member.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const handleResetPassword = () => {
    if (!selectedStaff) return;
    
    toast.success(`Password reset link sent to ${selectedStaff.name}`, {
      description: 'They will receive an email with instructions'
    });
    
    setIsResetPasswordOpen(false);
  };

  const handleFileUpload = (type: string) => {
    toast.info(`File upload for ${type} coming soon!`);
  };

  const handleDocumentDelete = (docId: string) => {
    if (!selectedStaff || !isManagement) {
      toast.error('Only management can delete documents');
      return;
    }
    
    const updatedDocs = selectedStaff.documents.filter(doc => doc.id !== docId);
    updateStaffMember(selectedStaff.id, { documents: updatedDocs });
    setSelectedStaff({ ...selectedStaff, documents: updatedDocs });
    
    toast.success('Document deleted successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedGender('all');
    setSelectedStatus('all');
    setSelectedStation('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentIcon = (type: string) => {
    return <FileText className="size-4" />;
  };

  const hasRequiredPhoto = (member: StaffMember) => {
    return member.photo && member.photo !== '';
  };

  const canEditMember = (member: StaffMember) => {
    return isManagement || member.id === currentUser.id;
  };

  // Desktop Table Row Component
  const StaffTableRow = ({ member }: { member: StaffMember }) => (
    <TableRow className="hover:bg-accent/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={member.photo} />
            <AvatarFallback>{member.name[0]}</AvatarFallback>
          </Avatar>
          {!hasRequiredPhoto(member) && (
            <AlertTriangle className="size-4 text-warning" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{member.name}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getRoleDisplayName(member.roles)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">{member.gender}</Badge>
      </TableCell>
      <TableCell>{member.phone}</TableCell>
      <TableCell>{formatDate(member.startDate)}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {member.status}
        </Badge>
      </TableCell>
      <TableCell>
        {member.station ? (
          <Badge variant="outline" className="capitalize">{member.station}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewProfile(member)}
            className="flex items-center gap-1"
          >
            <Eye className="size-3" />
            View
          </Button>
          
          {canEditMember(member) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditProfile(member)}
              className="flex items-center gap-1"
            >
              <Edit className="size-3" />
              Edit
            </Button>
          )}
          
          {isManagement && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusToggle(member)}>
                  {member.status === 'active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedStaff(member);
                  setIsResetPasswordOpen(true);
                }}>
                  Reset Password
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleDeleteStaff(member)}
                  className="text-destructive focus:text-destructive"
                >
                  Delete Staff
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  // Mobile Card Component
  const StaffCard = ({ member }: { member: StaffMember }) => (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewProfile(member)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar className="size-12">
              <AvatarImage src={member.photo} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            {!hasRequiredPhoto(member) && (
              <AlertTriangle className="size-4 text-warning absolute -top-1 -right-1" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{member.name}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getRoleDisplayName(member.roles)}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {member.gender}
              </Badge>
              {member.station && (
                <Badge variant="outline" className="text-xs capitalize">
                  {member.station}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {member.status}
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="size-3" />
            {member.phone}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3" />
            Started {formatDate(member.startDate)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
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
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredStaff.map((member) => (
                    <StaffCard key={member.id} member={member} />
                  ))}
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
                        <StaffTableRow key={member.id} member={member} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddStaffOpen} onOpenChange={setIsAddStaffOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Staff Member</DialogTitle>
            <DialogDescription>
              Fill in the details for the new staff member
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input 
                  value={addForm.name || ''} 
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Phone *</Label>
                <Input 
                  value={addForm.phone || ''} 
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input 
                  value={addForm.email || ''} 
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Gender *</Label>
                <Select 
                  value={addForm.gender || ''} 
                  onValueChange={(value) => setAddForm({ ...addForm, gender: value as 'male' | 'female' })}
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
                  value={addForm.roles?.[0] || ''} 
                  onValueChange={(value) => setAddForm({ ...addForm, roles: [value as UserRole] })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="head-of-kitchen">Head of Kitchen</SelectItem>
                    <SelectItem value="front-desk-manager">Front Desk Manager</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Station</Label>
                <Select 
                  value={addForm.station || ''} 
                  onValueChange={(value) => setAddForm({ ...addForm, station: value as Station })}
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
              
              <div>
                <Label>Start Date *</Label>
                <Input 
                  type="date"
                  value={addForm.startDate || ''} 
                  onChange={(e) => setAddForm({ ...addForm, startDate: e.target.value })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Status *</Label>
                <Select 
                  value={addForm.status || ''} 
                  onValueChange={(value) => setAddForm({ ...addForm, status: value as 'active' | 'inactive' })}
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Emergency Contact Name *</Label>
                <Input 
                  value={addForm.emergencyContact?.name || ''} 
                  onChange={(e) => setAddForm({ 
                    ...addForm, 
                    emergencyContact: { 
                      ...addForm.emergencyContact,
                      name: e.target.value,
                      phone: addForm.emergencyContact?.phone || ''
                    }
                  })}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Emergency Contact Phone *</Label>
                <Input 
                  value={addForm.emergencyContact?.phone || ''} 
                  onChange={(e) => setAddForm({ 
                    ...addForm, 
                    emergencyContact: { 
                      name: addForm.emergencyContact?.name || '',
                      phone: e.target.value
                    }
                  })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStaffOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewStaff}>
              Add Staff Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Photo *</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Avatar className="size-16">
                              <AvatarImage src={editForm.photo} />
                              <AvatarFallback>{editForm.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <Button onClick={() => handleFileUpload('photo')} variant="outline" size="sm">
                              <Camera className="size-4 mr-1" />
                              Change Photo
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Name *</Label>
                          <Input 
                            value={editForm.name || ''} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        {(isManagement || !editForm.roles?.includes('staff')) && (
                          <div>
                            <Label>Roles *</Label>
                            <Select 
                              value={editForm.roles?.[0] || ''} 
                              onValueChange={(value) => setEditForm({ ...editForm, roles: [value as UserRole] })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="head-of-kitchen">Head of Kitchen</SelectItem>
                                <SelectItem value="front-desk-manager">Front Desk Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label>Gender *</Label>
                          <Select 
                            value={editForm.gender || ''} 
                            onValueChange={(value) => setEditForm({ ...editForm, gender: value as 'male' | 'female' })}
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

                        {isManagement && (
                          <div className="flex items-center justify-between">
                            <Label>Active Status</Label>
                            <Switch 
                              checked={editForm.status === 'active'} 
                              onCheckedChange={(checked) => 
                                setEditForm({ ...editForm, status: checked ? 'active' : 'inactive' })
                              }
                            />
                          </div>
                        )}

                        <div>
                          <Label>Station</Label>
                          <Select 
                            value={editForm.station || ''} 
                            onValueChange={(value) => setEditForm({ ...editForm, station: value as Station })}
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

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            Save Changes
                          </Button>
                          <Button 
                            onClick={() => setIsEditing(false)} 
                            variant="outline" 
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </CardContent>
                </Card>

                {/* Details Tabs */}
                <div className="space-y-4">
                  <Tabs defaultValue="about">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-4">
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div>
                                <Label>Phone *</Label>
                                <Input 
                                  value={editForm.phone || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Email</Label>
                                <Input 
                                  value={editForm.email || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Start Date *</Label>
                                <Input 
                                  type="date"
                                  value={editForm.startDate || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Emergency Contact *</Label>
                                <div className="space-y-2 mt-1">
                                  <Input 
                                    placeholder="Contact name"
                                    value={editForm.emergencyContact?.name || ''} 
                                    onChange={(e) => setEditForm({ 
                                      ...editForm, 
                                      emergencyContact: { 
                                        ...editForm.emergencyContact,
                                        name: e.target.value,
                                        phone: editForm.emergencyContact?.phone || ''
                                      }
                                    })}
                                  />
                                  <Input 
                                    placeholder="Contact phone"
                                    value={editForm.emergencyContact?.phone || ''} 
                                    onChange={(e) => setEditForm({ 
                                      ...editForm, 
                                      emergencyContact: { 
                                        name: editForm.emergencyContact?.name || '',
                                        phone: e.target.value
                                      }
                                    })}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Documents
                            <Button onClick={() => handleFileUpload('document')} size="sm" variant="outline">
                              <Upload className="size-4 mr-1" />
                              Upload
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedStaff.documents.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                No documents uploaded yet
                              </div>
                            ) : (
                              selectedStaff.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {getDocumentIcon(doc.type)}
                                    <div>
                                      <div className="font-medium">{doc.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {doc.filename} • Uploaded by {doc.uploadedBy} • {formatDate(doc.uploadedDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost">
                                      <ExternalLink className="size-4" />
                                    </Button>
                                    {isManagement && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => handleDocumentDelete(doc.id)}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                              <Trophy className="size-6 mx-auto mb-2 text-yellow-500" />
                              <div className="text-2xl font-bold">{selectedStaff.pointsThisMonth}</div>
                              <div className="text-sm text-muted-foreground">Points this month</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <Trophy className="size-6 mx-auto mb-2 text-blue-500" />
                              <div className="text-2xl font-bold">{selectedStaff.pointsYTD}</div>
                              <div className="text-sm text-muted-foreground">Points YTD</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <User className="size-6 mx-auto mb-2 text-green-500" />
                              <div className="text-2xl font-bold">{selectedStaff.completedTasks}</div>
                              <div className="text-sm text-muted-foreground">Completed tasks</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <AlertTriangle className="size-6 mx-auto mb-2 text-red-500" />
                              <div className="text-2xl font-bold">{selectedStaff.disciplinaryCount}</div>
                              <div className="text-sm text-muted-foreground">
                                <button 
                                  onClick={onDisciplineClick}
                                  className="text-primary hover:underline"
                                >
                                  Disciplinary actions
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
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
    </>
  );
}

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
  const [editForm, setEditForm] = useState<Partial<StaffMember>>({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    toast.info('Add Staff feature coming soon!');
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
      finalForm.roles = selectedStaff.roles;
      finalForm.status = selectedStaff.status;
    }
    
    updateStaffMember(selectedStaff.id, finalForm);
    setSelectedStaff({ ...selectedStaff, ...finalForm });
    setIsEditing(false);
    
    toast.success('Profile updated successfully');
  };

  const handleStatusToggle = (member: StaffMember) => {
    if (!isManagement) {
      toast.error('Only management can change staff status');
      return;
    }
    
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    updateStaffMember(member.id, { status: newStatus });
    
    toast.success(`${member.name} has been ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
  };

  const handleResetPassword = () => {
    if (!selectedStaff) return;
    
    toast.success(`Password reset link sent to ${selectedStaff.name}`, {
      description: 'They will receive an email with instructions'
    });
    
    setIsResetPasswordOpen(false);
  };

  const handleFileUpload = (type: string) => {
    toast.info(`File upload for ${type} coming soon!`);
  };

  const handleDocumentDelete = (docId: string) => {
    if (!selectedStaff || !isManagement) {
      toast.error('Only management can delete documents');
      return;
    }
    
    const updatedDocs = selectedStaff.documents.filter(doc => doc.id !== docId);
    updateStaffMember(selectedStaff.id, { documents: updatedDocs });
    setSelectedStaff({ ...selectedStaff, documents: updatedDocs });
    
    toast.success('Document deleted successfully');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedGender('all');
    setSelectedStatus('all');
    setSelectedStation('all');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDocumentIcon = (type: string) => {
    return <FileText className="size-4" />;
  };

  const hasRequiredPhoto = (member: StaffMember) => {
    return member.photo && member.photo !== '';
  };

  const canEditMember = (member: StaffMember) => {
    return isManagement || member.id === currentUser.id;
  };

  // Desktop Table Row Component
  const StaffTableRow = ({ member }: { member: StaffMember }) => (
    <TableRow className="hover:bg-accent/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage src={member.photo} />
            <AvatarFallback>{member.name[0]}</AvatarFallback>
          </Avatar>
          {!hasRequiredPhoto(member) && (
            <AlertTriangle className="size-4 text-warning" />
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{member.name}</div>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{getRoleDisplayName(member.roles)}</Badge>
      </TableCell>
      <TableCell>
        <Badge variant="secondary" className="capitalize">{member.gender}</Badge>
      </TableCell>
      <TableCell>{member.phone}</TableCell>
      <TableCell>{formatDate(member.startDate)}</TableCell>
      <TableCell>
        <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
          {member.status}
        </Badge>
      </TableCell>
      <TableCell>
        {member.station ? (
          <Badge variant="outline" className="capitalize">{member.station}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewProfile(member)}
            className="flex items-center gap-1"
          >
            <Eye className="size-3" />
            View
          </Button>
          
          {canEditMember(member) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditProfile(member)}
              className="flex items-center gap-1"
            >
              <Edit className="size-3" />
              Edit
            </Button>
          )}
          
          {isManagement && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusToggle(member)}>
                  {member.status === 'active' ? 'Deactivate' : 'Activate'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  setSelectedStaff(member);
                  setIsResetPasswordOpen(true);
                }}>
                  Reset Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  // Mobile Card Component
  const StaffCard = ({ member }: { member: StaffMember }) => (
    <Card className="cursor-pointer hover:bg-accent/50" onClick={() => handleViewProfile(member)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <Avatar className="size-12">
              <AvatarImage src={member.photo} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
            {!hasRequiredPhoto(member) && (
              <AlertTriangle className="size-4 text-warning absolute -top-1 -right-1" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{member.name}</h4>
            <div className="flex flex-wrap gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {getRoleDisplayName(member.roles)}
              </Badge>
              <Badge variant="secondary" className="text-xs capitalize">
                {member.gender}
              </Badge>
              {member.station && (
                <Badge variant="outline" className="text-xs capitalize">
                  {member.station}
                </Badge>
              )}
            </div>
          </div>
          <Badge variant={member.status === 'active' ? 'default' : 'secondary'} className="capitalize">
            {member.status}
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Phone className="size-3" />
            {member.phone}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3" />
            Started {formatDate(member.startDate)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
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
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredStaff.map((member) => (
                    <StaffCard key={member.id} member={member} />
                  ))}
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
                        <StaffTableRow key={member.id} member={member} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
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

              <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label>Photo *</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Avatar className="size-16">
                              <AvatarImage src={editForm.photo} />
                              <AvatarFallback>{editForm.name?.[0]}</AvatarFallback>
                            </Avatar>
                            <Button onClick={() => handleFileUpload('photo')} variant="outline" size="sm">
                              <Camera className="size-4 mr-1" />
                              Change Photo
                            </Button>
                          </div>
                        </div>

                        <div>
                          <Label>Name *</Label>
                          <Input 
                            value={editForm.name || ''} 
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>

                        {(isManagement || !editForm.roles?.includes('staff')) && (
                          <div>
                            <Label>Roles *</Label>
                            <Select 
                              value={editForm.roles?.[0] || ''} 
                              onValueChange={(value) => setEditForm({ ...editForm, roles: [value as UserRole] })}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="owner">Owner</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="head-of-kitchen">Head of Kitchen</SelectItem>
                                <SelectItem value="front-desk-manager">Front Desk Manager</SelectItem>
                                <SelectItem value="staff">Staff</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div>
                          <Label>Gender *</Label>
                          <Select 
                            value={editForm.gender || ''} 
                            onValueChange={(value) => setEditForm({ ...editForm, gender: value as 'male' | 'female' })}
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

                        {isManagement && (
                          <div className="flex items-center justify-between">
                            <Label>Active Status</Label>
                            <Switch 
                              checked={editForm.status === 'active'} 
                              onCheckedChange={(checked) => 
                                setEditForm({ ...editForm, status: checked ? 'active' : 'inactive' })
                              }
                            />
                          </div>
                        )}

                        <div>
                          <Label>Station</Label>
                          <Select 
                            value={editForm.station || ''} 
                            onValueChange={(value) => setEditForm({ ...editForm, station: value as Station })}
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

                        <div className="flex gap-2 pt-4">
                          <Button onClick={handleSaveProfile} className="flex-1">
                            Save Changes
                          </Button>
                          <Button 
                            onClick={() => setIsEditing(false)} 
                            variant="outline" 
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
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
                    )}
                  </CardContent>
                </Card>

                {/* Details Tabs */}
                <div className="space-y-4">
                  <Tabs defaultValue="about">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="about">About</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                      <TabsTrigger value="history">History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="about" className="space-y-4">
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div>
                                <Label>Phone *</Label>
                                <Input 
                                  value={editForm.phone || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Email</Label>
                                <Input 
                                  value={editForm.email || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Start Date *</Label>
                                <Input 
                                  type="date"
                                  value={editForm.startDate || ''} 
                                  onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                                  className="mt-1"
                                />
                              </div>

                              <div>
                                <Label>Emergency Contact *</Label>
                                <div className="space-y-2 mt-1">
                                  <Input 
                                    placeholder="Contact name"
                                    value={editForm.emergencyContact?.name || ''} 
                                    onChange={(e) => setEditForm({ 
                                      ...editForm, 
                                      emergencyContact: { 
                                        ...editForm.emergencyContact,
                                        name: e.target.value,
                                        phone: editForm.emergencyContact?.phone || ''
                                      }
                                    })}
                                  />
                                  <Input 
                                    placeholder="Contact phone"
                                    value={editForm.emergencyContact?.phone || ''} 
                                    onChange={(e) => setEditForm({ 
                                      ...editForm, 
                                      emergencyContact: { 
                                        name: editForm.emergencyContact?.name || '',
                                        phone: e.target.value
                                      }
                                    })}
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
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
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            Documents
                            <Button onClick={() => handleFileUpload('document')} size="sm" variant="outline">
                              <Upload className="size-4 mr-1" />
                              Upload
                            </Button>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedStaff.documents.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                No documents uploaded yet
                              </div>
                            ) : (
                              selectedStaff.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {getDocumentIcon(doc.type)}
                                    <div>
                                      <div className="font-medium">{doc.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {doc.filename} • Uploaded by {doc.uploadedBy} • {formatDate(doc.uploadedDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button size="sm" variant="ghost">
                                      <ExternalLink className="size-4" />
                                    </Button>
                                    {isManagement && (
                                      <Button 
                                        size="sm" 
                                        variant="ghost"
                                        onClick={() => handleDocumentDelete(doc.id)}
                                      >
                                        <Trash2 className="size-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="history">
                      <Card>
                        <CardHeader>
                          <CardTitle>Performance History</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 border rounded-lg">
                              <Trophy className="size-6 mx-auto mb-2 text-yellow-500" />
                              <div className="text-2xl font-bold">{selectedStaff.pointsThisMonth}</div>
                              <div className="text-sm text-muted-foreground">Points this month</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <Trophy className="size-6 mx-auto mb-2 text-blue-500" />
                              <div className="text-2xl font-bold">{selectedStaff.pointsYTD}</div>
                              <div className="text-sm text-muted-foreground">Points YTD</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <User className="size-6 mx-auto mb-2 text-green-500" />
                              <div className="text-2xl font-bold">{selectedStaff.completedTasks}</div>
                              <div className="text-sm text-muted-foreground">Completed tasks</div>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <AlertTriangle className="size-6 mx-auto mb-2 text-red-500" />
                              <div className="text-2xl font-bold">{selectedStaff.disciplinaryCount}</div>
                              <div className="text-sm text-muted-foreground">
                                <button 
                                  onClick={onDisciplineClick}
                                  className="text-primary hover:underline"
                                >
                                  Disciplinary actions
                                </button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
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
    </>
  );
}