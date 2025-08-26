"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  GraduationCap,
  CheckCircle,
  Clock,
  Star,
  Award,
  User,
  Filter,
  X,
  Edit,
  Trash2,
  Crown,
  AlertCircle,
  Save,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../ui/tooltip';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { currentUser, managementBudgets } from '../../lib/data';
import { staffMembers } from '../../lib/staff-data';
import { 
  skills,
  staffSkills,
  getLevelColor,
  addStaffSkill,
  updateStaffSkill,
  deleteStaffSkill,
  getStaffSkill,
  getStaffSkills,
  getSkillByName,
  isSkillExclusive,
  type StaffSkill,
  type Skill
} from '../../lib/operations-data';
import { toast } from "sonner@2.0.3";

export function SkillsPage() {
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [selectedSkill, setSelectedSkill] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<string | null>(null);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isEditSkillOpen, setIsEditSkillOpen] = useState(false);
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStaffSkill, setSelectedStaffSkill] = useState<StaffSkill | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const skillAwardDefault = 50;

  // Form state
  const [addSkillForm, setAddSkillForm] = useState({
    staffId: '',
    skillName: '',
    level: 'basic' as StaffSkill['level'],
    verified: false,
    isExclusive: false,
    notes: ''
  });

  const [editSkillForm, setEditSkillForm] = useState({
    level: 'basic' as StaffSkill['level'],
    isExclusive: false,
    notes: ''
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  const currentBudget = managementBudgets.get(currentUser.id) || 500;

  // Get unique categories
  const categories = Array.from(new Set(skills.map(skill => skill.category)));

  // Filter staff
  const filteredStaff = useMemo(() => {
    return staffMembers.filter(member => {
      if (searchQuery && !member.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedRole !== 'all') {
        if (selectedRole === 'management' && !member.roles.some(role => 
          ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
        )) return false;
        if (selectedRole !== 'management' && !member.roles.includes(selectedRole as any)) return false;
      }
      if (selectedStation !== 'all' && member.station !== selectedStation) return false;
      return true;
    });
  }, [searchQuery, selectedRole, selectedStation]);

  // Filter skills based on selected category and skill name
  const filteredSkills = useMemo(() => {
    return skills.filter(skill => {
      if (selectedCategory !== 'all' && skill.category !== selectedCategory) return false;
      if (selectedSkill !== 'all' && skill.name !== selectedSkill) return false;
      return true;
    });
  }, [selectedCategory, selectedSkill]);

  const getPendingVerifications = (): StaffSkill[] => {
    return staffSkills.filter(ss => ss.requestedVerification && !ss.verified);
  };

  const handleAddSkill = () => {
    setAddSkillForm({
      staffId: selectedStaff || '',
      skillName: '',
      level: 'basic',
      verified: false,
      isExclusive: false,
      notes: ''
    });
    setIsAddSkillOpen(true);
  };

  const handleSaveSkill = () => {
    if (!addSkillForm.staffId || !addSkillForm.skillName) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Check if skill already exists for this staff member
    const existingSkill = getStaffSkill(addSkillForm.staffId, addSkillForm.skillName);
    if (existingSkill) {
      toast.error('This staff member already has this skill');
      return;
    }

    // Check if trying to add exclusive skill that someone else already has
    if (addSkillForm.isExclusive && isSkillExclusive(addSkillForm.skillName)) {
      toast.error('This skill is already exclusively assigned to another staff member');
      return;
    }

    let pointsAwarded = 0;
    if (addSkillForm.verified) {
      pointsAwarded = 50;
      if (pointsAwarded > currentBudget) {
        toast.error(`Insufficient budget. You have RM${currentBudget} remaining today.`);
        return;
      }
    }

    const newSkill = addStaffSkill({
      staffId: addSkillForm.staffId,
      skillName: addSkillForm.skillName,
      level: addSkillForm.level,
      verified: addSkillForm.verified,
      verifiedBy: addSkillForm.verified ? currentUser.id : undefined,
      verifiedDate: addSkillForm.verified ? new Date().toISOString().split('T')[0] : undefined,
      pointsAwarded: addSkillForm.verified ? pointsAwarded : undefined,
      requestedVerification: false,
      isExclusive: addSkillForm.isExclusive,
      notes: addSkillForm.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const staff = staffMembers.find(s => s.id === addSkillForm.staffId);
    if (addSkillForm.verified) {
      toast.success(`Skill added and verified! +${pointsAwarded} points awarded to ${staff?.name}`);
    } else {
      toast.success(`Skill added for ${staff?.name}`);
    }

    setIsAddSkillOpen(false);
  };

  const handleEditSkill = (skill: StaffSkill) => {
    setSelectedStaffSkill(skill);
    setEditSkillForm({
      level: skill.level,
      isExclusive: skill.isExclusive || false,
      notes: skill.notes || ''
    });
    setIsEditSkillOpen(true);
  };

  const handleUpdateSkill = () => {
    if (!selectedStaffSkill) return;

    // Check if trying to make exclusive when someone else already has it exclusively
    if (editSkillForm.isExclusive && !selectedStaffSkill.isExclusive && 
        isSkillExclusive(selectedStaffSkill.skillName, selectedStaffSkill.staffId)) {
      toast.error('This skill is already exclusively assigned to another staff member');
      return;
    }

    const updated = updateStaffSkill(selectedStaffSkill.id, {
      level: editSkillForm.level,
      isExclusive: editSkillForm.isExclusive,
      notes: editSkillForm.notes
    });

    if (updated) {
      const staff = staffMembers.find(s => s.id === selectedStaffSkill.staffId);
      toast.success(`Skill updated for ${staff?.name}`);
      setIsEditSkillOpen(false);
    } else {
      toast.error('Failed to update skill');
    }
  };

  const handleDeleteSkill = () => {
    if (!selectedStaffSkill) return;

    const success = deleteStaffSkill(selectedStaffSkill.id);
    if (success) {
      const staff = staffMembers.find(s => s.id === selectedStaffSkill.staffId);
      toast.success(`Skill removed from ${staff?.name}`);
      setIsDeleteDialogOpen(false);
      setSelectedStaffSkill(null);
    } else {
      toast.error('Failed to delete skill');
    }
  };

  const handleVerifySkill = () => {
    if (!selectedStaffSkill) return;

    const updated = updateStaffSkill(selectedStaffSkill.id, {
      verified: true,
      verifiedBy: currentUser.id,
      verifiedDate: new Date().toISOString().split('T')[0],
      pointsAwarded: selectedStaffSkill.verified ? selectedStaffSkill.pointsAwarded : skillAwardDefault,
      requestedVerification: false
    });

    if (updated) {
      const staff = staffMembers.find(s => s.id === selectedStaffSkill.staffId);
      toast.success(`Skill verified! +${skillAwardDefault} points awarded to ${staff?.name}`);
      setIsVerificationOpen(false);
    } else {
      toast.error('Failed to verify skill');
    }
  };

  const handleDenyVerification = (skill?: StaffSkill) => {
    const target = skill || selectedStaffSkill;
    if (!target) return;
    const updated = updateStaffSkill(target.id, { requestedVerification: false });
    if (updated) {
      const staff = staffMembers.find(s => s.id === target.staffId);
      toast.info(`Verification request denied for ${target.skillName} - ${staff?.name}`);
      setIsVerificationOpen(false);
    } else {
      toast.error('Failed to update skill');
    }
  };

  const handleRequestVerification = (staffId: string, skillName: string) => {
    const skill = getStaffSkill(staffId, skillName);
    if (skill && !skill.verified) {
      const updated = updateStaffSkill(skill.id, {
        requestedVerification: true
      });
      
      if (updated) {
        const staff = staffMembers.find(s => s.id === staffId);
        toast.info(`Verification requested for ${skillName} - ${staff?.name}`);
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedRole('all');
    setSelectedStation('all');
    setSelectedSkill('all');
    setSelectedCategory('all');
  };

  const getLevelDisplay = (level: string) => {
    const levels = {
      'basic': 'Basic',
      'proficient': 'Proficient',
      'expert': 'Expert'
    };
    return levels[level as keyof typeof levels] || level;
  };

  const getLevelDot = (level: string, verified: boolean, isExclusive?: boolean) => {
    const colorClass = getLevelColor(level);
    const opacity = verified ? 'opacity-100' : 'opacity-50';
    const bgColor = colorClass.includes('success') ? 'bg-success' : 
                   colorClass.includes('warning') ? 'bg-warning' : 
                   colorClass.includes('default') ? 'bg-primary' : 'bg-secondary';
    
    return (
      <div className="relative">
        <div className={`size-3 rounded-full ${bgColor} ${opacity}`} />
        {isExclusive && (
          <Crown className="size-2 text-yellow-500 absolute -top-1 -right-1" />
        )}
      </div>
    );
  };

  const pendingVerifications = getPendingVerifications();

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Skills</h1>
              <p className="text-muted-foreground">Staff skills matrix and verification system</p>
            </div>
            
            {isManagement && (
              <div className="flex items-center gap-2">
                {pendingVerifications.length > 0 && (
                  <Badge variant="warning" className="mr-2">
                    {pendingVerifications.length} pending verification{pendingVerifications.length !== 1 ? 's' : ''}
                  </Badge>
                )}
                <Button onClick={handleAddSkill} className="flex items-center gap-2">
                  <Plus className="size-4" />
                  Add Skill to Staff
                </Button>
              </div>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search staff..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="management">Management</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
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

                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Skills</SelectItem>
                    {filteredSkills.map(skill => (
                      <SelectItem key={skill.id} value={skill.name}>{skill.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(searchQuery || selectedRole !== 'all' || selectedStation !== 'all' || 
                  selectedSkill !== 'all' || selectedCategory !== 'all') && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Skills Matrix */}
        <div>
          {filteredStaff.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="size-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                No staff match your filters.
              </div>
            </div>
          ) : (
            <>
              {isMobile ? (
                // Mobile: Staff Skills List
                <div className="space-y-4">
                  {filteredStaff.map((staff) => {
                    const staffSkillsList = getStaffSkills(staff.id);
                    const displaySkills = selectedSkill === 'all' ? 
                      staffSkillsList : 
                      staffSkillsList.filter(s => s.skillName === selectedSkill);
                    
                    return (
                      <Card key={staff.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-10">
                                <AvatarImage src={staff.photo} />
                                <AvatarFallback>{staff.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div>{staff.name}</div>
                                <div className="text-sm text-muted-foreground capitalize">
                                  {staff.roles.join(', ').replace(/-/g, ' ')}
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline">{displaySkills.length} skills</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {displaySkills.length === 0 ? (
                            <div className="text-muted-foreground text-sm">No skills recorded</div>
                          ) : (
                            <div className="space-y-3">
                              {displaySkills.map((skill) => (
                                <div key={skill.id} className="flex items-center justify-between p-2 border rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {getLevelDot(skill.level, skill.verified, skill.isExclusive)}
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{skill.skillName}</span>
                                        {skill.isExclusive && (
                                          <Crown className="size-3 text-yellow-500" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={getLevelColor(skill.level)} className="text-xs">
                                          {getLevelDisplay(skill.level)}
                                        </Badge>
                                        {skill.verified ? (
                                          <CheckCircle className="size-3 text-success" />
                                        ) : skill.requestedVerification ? (
                                          <Clock className="size-3 text-warning" />
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {!skill.verified && staff.id === currentUser.id && (
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        onClick={() => handleRequestVerification(staff.id, skill.skillName)}
                                      >
                                        Request Verification
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
                                          {!skill.verified && (
                                            <>
                                              <DropdownMenuItem
                                                onClick={() => {
                                                  setSelectedStaffSkill(skill);
                                                  setIsVerificationOpen(true);
                                                }}
                                              >
                                                {skill.requestedVerification ? 'Review Request' : 'Verify Skill'}
                                              </DropdownMenuItem>
                                              {skill.requestedVerification && (
                                                <DropdownMenuItem onClick={() => handleDenyVerification(skill)}>
                                                  Deny Request
                                                </DropdownMenuItem>
                                              )}
                                            </>
                                          )}
                                          <DropdownMenuItem onClick={() => handleEditSkill(skill)}>
                                            Edit Skill
                                          </DropdownMenuItem>
                                          <DropdownMenuItem 
                                            onClick={() => {
                                              setSelectedStaffSkill(skill);
                                              setIsDeleteDialogOpen(true);
                                            }}
                                            className="text-destructive"
                                          >
                                            Delete Skill
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                // Desktop: Skills Matrix Table
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky left-0 bg-background">Staff</TableHead>
                        {filteredSkills.map((skill) => (
                          <TableHead key={skill.id} className="text-center min-w-36">
                            <div className="space-y-1">
                              <div className="flex items-center justify-center gap-1">
                                <span className="font-medium">{skill.name}</span>
                                {skill.hasExclusiveAssignment && (
                                  <Crown className="size-3 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{skill.category}</div>
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="sticky left-0 bg-background">
                            <div className="flex items-center gap-3">
                              <Avatar className="size-8">
                                <AvatarImage src={staff.photo} />
                                <AvatarFallback className="text-xs">{staff.name[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{staff.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {staff.roles.join(', ').replace(/-/g, ' ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          {filteredSkills.map((skill) => {
                            const staffSkill = getStaffSkill(staff.id, skill.name);
                            return (
                              <TableCell key={skill.id} className="text-center">
                                {staffSkill ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="flex items-center justify-center gap-2">
                                            {getLevelDot(staffSkill.level, staffSkill.verified, staffSkill.isExclusive)}
                                            {staffSkill.verified ? (
                                              <CheckCircle className="size-3 text-success" />
                                            ) : staffSkill.requestedVerification ? (
                                              isManagement ? (
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2 text-xs"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedStaffSkill(staffSkill);
                                                    setIsVerificationOpen(true);
                                                  }}
                                                >
                                                  Review
                                                </Button>
                                              ) : (
                                                <Clock className="size-3 text-warning" />
                                              )
                                            ) : (
                                              isManagement ? (
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="h-6 px-2 text-xs"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedStaffSkill(staffSkill);
                                                    setIsVerificationOpen(true);
                                                  }}
                                                >
                                                  Verify
                                                </Button>
                                              ) : (
                                                staff.id === currentUser.id && (
                                                  <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRequestVerification(staff.id, skill.name);
                                                    }}
                                                  >
                                                    Request
                                                  </Button>
                                                )
                                              )
                                            )}
                                          </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <div className="text-center">
                                            <div className="font-medium flex items-center gap-1">
                                              {getLevelDisplay(staffSkill.level)}
                                              {staffSkill.isExclusive && <Crown className="size-3 text-yellow-500" />}
                                            </div>
                                            {staffSkill.verified ? (
                                              <div className="text-xs">
                                                Verified by {staffMembers.find(s => s.id === staffSkill.verifiedBy)?.name} on {staffSkill.verifiedDate}
                                              </div>
                                            ) : staffSkill.requestedVerification ? (
                                              <div className="text-xs">Pending verification</div>
                                            ) : (
                                              <div className="text-xs">Not verified</div>
                                            )}
                                            {staffSkill.notes && (
                                              <div className="text-xs mt-1 text-muted-foreground">{staffSkill.notes}</div>
                                            )}
                                          </div>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                    {isManagement && (
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6"
                                        onClick={() => handleEditSkill(staffSkill)}
                                      >
                                        <Edit className="size-3" />
                                      </Button>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-muted-foreground">—</div>
                                )}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Budget Info for Management */}
        {isManagement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="size-5 text-yellow-500" />
                Skills Budget
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Daily Budget Remaining</span>
                  <span className="font-medium">RM{currentBudget} / RM500</span>
                </div>
                <Progress value={(currentBudget / 500) * 100} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  Each skill verification awards +{skillAwardDefault} points without affecting budget
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={isAddSkillOpen} onOpenChange={setIsAddSkillOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Skill to Staff</DialogTitle>
            <DialogDescription>
              Record a new skill for a staff member
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div>
              <Label>Staff Member *</Label>
              <Select value={addSkillForm.staffId} onValueChange={(value) => 
                setAddSkillForm(prev => ({ ...prev, staffId: value }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map(member => (
                    <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Skill *</Label>
              <Select value={addSkillForm.skillName} onValueChange={(value) => 
                setAddSkillForm(prev => ({ ...prev, skillName: value }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select skill" />
                </SelectTrigger>
                <SelectContent>
                  {skills.map(skill => (
                    <SelectItem key={skill.id} value={skill.name}>
                      <div className="flex items-center gap-2">
                        {skill.name}
                        {skill.hasExclusiveAssignment && <Crown className="size-3 text-yellow-500" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Level *</Label>
              <Select value={addSkillForm.level} onValueChange={(value) => 
                setAddSkillForm(prev => ({ ...prev, level: value as StaffSkill['level'] }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="proficient">Proficient</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="verified"
                checked={addSkillForm.verified}
                onCheckedChange={(checked) => setAddSkillForm(prev => ({ ...prev, verified: checked }))}
              />
              <Label htmlFor="verified">Verified (awards +{skillAwardDefault} points)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="exclusive"
                checked={addSkillForm.isExclusive}
                onCheckedChange={(checked) => setAddSkillForm(prev => ({ ...prev, isExclusive: checked }))}
              />
              <Label htmlFor="exclusive" className="flex items-center gap-1">
                Exclusive skill 
                <Crown className="size-3 text-yellow-500" />
              </Label>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={addSkillForm.notes}
                onChange={(e) => setAddSkillForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about this skill..."
                className="mt-1"
              />
            </div>

            {addSkillForm.verified && (
              <div className="space-y-2">
                <Label className="text-sm">Verification Award</Label>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Points Award:</span>
                    <span className="font-semibold text-green-600">+{skillAwardDefault}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSkill}>
              {addSkillForm.verified ? 'Add & Verify Skill' : 'Add Skill'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={isEditSkillOpen} onOpenChange={setIsEditSkillOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Skill</DialogTitle>
            <DialogDescription>
              Update skill details
            </DialogDescription>
          </DialogHeader>

          {selectedStaffSkill && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="size-16 mx-auto mb-3">
                  <AvatarImage src={staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.photo} />
                  <AvatarFallback>
                    {staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.name}</h3>
                <div className="text-sm text-muted-foreground">{selectedStaffSkill.skillName}</div>
              </div>

              <div>
                <Label>Level</Label>
                <Select value={editSkillForm.level} onValueChange={(value) => 
                  setEditSkillForm(prev => ({ ...prev, level: value as StaffSkill['level'] }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="proficient">Proficient</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-exclusive"
                  checked={editSkillForm.isExclusive}
                  onCheckedChange={(checked) => setEditSkillForm(prev => ({ ...prev, isExclusive: checked }))}
                />
                <Label htmlFor="edit-exclusive" className="flex items-center gap-1">
                  Exclusive skill 
                  <Crown className="size-3 text-yellow-500" />
                </Label>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={editSkillForm.notes}
                  onChange={(e) => setEditSkillForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditSkillOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSkill}>
              <Save className="size-4 mr-1" />
              Update Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog open={isVerificationOpen} onOpenChange={setIsVerificationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Skill</DialogTitle>
            <DialogDescription>
              Confirm skill verification and award points
            </DialogDescription>
          </DialogHeader>

          {selectedStaffSkill && (
            <div className="space-y-4">
              <div className="text-center">
                <Avatar className="size-16 mx-auto mb-3">
                  <AvatarImage src={staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.photo} />
                  <AvatarFallback>
                    {staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.name[0]}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{staffMembers.find(s => s.id === selectedStaffSkill.staffId)?.name}</h3>
                <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                  {selectedStaffSkill.skillName}
                  {selectedStaffSkill.isExclusive && <Crown className="size-3 text-yellow-500" />}
                </div>
                <Badge variant={getLevelColor(selectedStaffSkill.level)} className="mt-2">
                  {getLevelDisplay(selectedStaffSkill.level)}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Points Award:</span>
                  <span className="font-semibold text-green-600">+{skillAwardDefault}</span>
                </div>
              </div>

              {selectedStaffSkill.notes && (
                <div>
                  <Label className="text-sm text-muted-foreground">Notes</Label>
                  <p className="text-sm mt-1">{selectedStaffSkill.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVerificationOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => handleDenyVerification()}>
              Deny
            </Button>
            <Button onClick={handleVerifySkill}>
              <Award className="size-4 mr-1" />
              Verify & Award Points
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this skill from {staffMembers.find(s => s.id === selectedStaffSkill?.staffId)?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSkill}>
              <Trash2 className="size-4 mr-1" />
              Delete Skill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}