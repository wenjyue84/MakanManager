"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Calendar,
  Clock,
  MapPin,
  Camera,
  Trash2,
  Eye,
  Filter,
  X,
  AlertTriangle,
  Package
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
import { currentUser } from '../../lib/data';
import { staffMembers } from '../../lib/staff-data';
import {
  disposals,
  formatTime,
  type Disposal
} from '../../lib/operations-data';
import { Station } from '../../lib/types';
import { toast } from "sonner@2.0.3";

export function DisposalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedStation, setSelectedStation] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDisposal, setSelectedDisposal] = useState<Disposal | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [disposalList, setDisposalList] = useState<Disposal[]>(() => [...disposals]);

  // Form state
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    item: '',
    quantity: '',
    unit: '',
    reason: 'expired' as Disposal['reason'],
    station: 'kitchen' as Station,
    thrownBy: currentUser.id,
    photo: '',
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

  // Filter disposals
  const filteredDisposals = useMemo(() => {
    return disposalList
      .filter(disposal => {
        if (searchQuery && !disposal.item.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (selectedReason !== 'all' && disposal.reason !== selectedReason) return false;
        if (selectedStation !== 'all' && disposal.station !== selectedStation) return false;
        if (startDate && new Date(disposal.date) < new Date(startDate)) return false;
        if (endDate && new Date(disposal.date) > new Date(endDate)) return false;
        return true;
      })
      .sort((a, b) =>
        new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime()
      );
  }, [disposalList, searchQuery, selectedReason, selectedStation, startDate, endDate]);

  const summaryByReason = useMemo(() => {
    return filteredDisposals.reduce((acc, d) => {
      acc[d.reason] = (acc[d.reason] ?? 0) + 1;
      return acc;
    }, {} as Record<Disposal['reason'], number>);
  }, [filteredDisposals]);

  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  const handleCreateDisposal = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      item: '',
      quantity: '',
      unit: '',
      reason: 'expired',
      station: 'kitchen',
      thrownBy: currentUser.id,
      photo: '',
      notes: ''
    });
    setIsCreateOpen(true);
  };

  const handleSaveDisposal = () => {
    if (!formData.item || !formData.quantity || !formData.unit) {
      toast.error('Please fill in all required fields');
      return;
    }
    const newDisposal: Disposal = {
      id: (Date.now().toString()),
      date: formData.date,
      time: formData.time,
      item: formData.item,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      reason: formData.reason,
      station: formData.station,
      thrownBy: formData.thrownBy,
      photo: formData.photo,
      notes: formData.notes,
      createdAt: new Date(`${formData.date}T${formData.time}`).toISOString()
    };
    setDisposalList(prev => [...prev, newDisposal]);
    toast.success('Disposal recorded successfully');
    setIsCreateOpen(false);
  };

  const handlePhotoUpload = () => {
    toast.info('Photo upload feature coming soon!');
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedReason('all');
    setSelectedStation('all');
    setStartDate('');
    setEndDate('');
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'expired': return 'destructive';
      case 'spoiled': return 'destructive';
      case 'overcooked': return 'warning';
      case 'prep-error': return 'warning';
      case 'other': return 'secondary';
      default: return 'secondary';
    }
  };

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'expired': return 'Expired';
      case 'spoiled': return 'Spoiled';
      case 'overcooked': return 'Overcooked';
      case 'prep-error': return 'Prep Error';
      case 'other': return 'Other';
      default: return reason;
    }
  };

  // Mobile Card Component
  const DisposalCard = ({ disposal }: { disposal: Disposal }) => {
    const thrownBy = getUserById(disposal.thrownBy);

    return (
      <Card className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedDisposal(disposal);
        setIsDetailOpen(true);
      }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{disposal.item}</h4>
                <div className="text-sm text-muted-foreground">
                  {disposal.quantity} {disposal.unit}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getReasonColor(disposal.reason)} className="text-xs">
                    {getReasonLabel(disposal.reason)}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {disposal.station}
                  </Badge>
                </div>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <div>{disposal.date}</div>
                <div>{formatTime(disposal.time)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={thrownBy?.photo} />
                <AvatarFallback className="text-xs">{thrownBy?.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{thrownBy?.name}</span>
            </div>

            {disposal.photo && (
              <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                <img src={disposal.photo} alt={disposal.item} className="w-full h-full object-cover" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Row Component
  const DisposalTableRow = ({ disposal }: { disposal: Disposal }) => {
    const thrownBy = getUserById(disposal.thrownBy);

    return (
      <TableRow className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedDisposal(disposal);
        setIsDetailOpen(true);
      }}>
        <TableCell>
          <div className="size-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
            {disposal.photo ? (
              <img src={disposal.photo} alt={disposal.item} className="w-full h-full object-cover" />
            ) : (
              <Camera className="size-4 text-muted-foreground" />
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="space-y-1">
            <div>{disposal.date}</div>
            <div className="text-sm text-muted-foreground">{formatTime(disposal.time)}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="font-medium">{disposal.item}</div>
        </TableCell>
        <TableCell>
          <div>{disposal.quantity} {disposal.unit}</div>
        </TableCell>
        <TableCell>
          <Badge variant={getReasonColor(disposal.reason)}>
            {getReasonLabel(disposal.reason)}
          </Badge>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={thrownBy?.photo} />
              <AvatarFallback className="text-xs">{thrownBy?.name[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm">{thrownBy?.name}</span>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant="outline" className="capitalize">{disposal.station}</Badge>
        </TableCell>
        <TableCell>
          <div className="text-sm">{disposal.notes || '—'}</div>
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
              <h1 className="text-2xl font-bold">Disposal</h1>
              <p className="text-muted-foreground">Track food waste and disposal reasons</p>
            </div>
            
            <Button onClick={handleCreateDisposal} className="flex items-center gap-2">
              <Plus className="size-4" />
              New Disposal
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search disposals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />

                <Select value={selectedReason} onValueChange={setSelectedReason}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="spoiled">Spoiled</SelectItem>
                    <SelectItem value="overcooked">Overcooked</SelectItem>
                    <SelectItem value="prep-error">Prep Error</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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

                {(searchQuery || selectedReason !== 'all' || selectedStation !== 'all' || startDate || endDate) && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
        </div>
      </div>

        {/* Summary */}
        {filteredDisposals.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Disposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{filteredDisposals.length}</p>
              </CardContent>
            </Card>
            {Object.entries(summaryByReason).map(([reason, count]) => (
              <Card key={reason}>
                <CardHeader>
                  <CardTitle>{getReasonLabel(reason)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Disposals List */}
        <div>
          {filteredDisposals.length === 0 ? (
            <div className="text-center py-12">
              <Trash2 className="size-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                No disposals recorded for the selected filters.
              </div>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredDisposals.map((disposal) => (
                    <DisposalCard key={disposal.id} disposal={disposal} />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Photo</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Qty/Unit</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Thrown by</TableHead>
                        <TableHead>Station</TableHead>
                        <TableHead>Notes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDisposals.map((disposal) => (
                        <DisposalTableRow key={disposal.id} disposal={disposal} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create Disposal Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record Disposal</DialogTitle>
            <DialogDescription>
              Log items that were thrown away
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Time *</Label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Item *</Label>
              <Input
                value={formData.item}
                onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
                placeholder="e.g., Coconut milk, Lettuce, Chicken"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Unit *</Label>
                <Select value={formData.unit} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, unit: value }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="L">L</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="pcs">pcs</SelectItem>
                    <SelectItem value="boxes">boxes</SelectItem>
                    <SelectItem value="plates">plates</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Reason *</Label>
                <Select value={formData.reason} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, reason: value as Disposal['reason'] }))
                }>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="spoiled">Spoiled</SelectItem>
                    <SelectItem value="overcooked">Overcooked</SelectItem>
                    <SelectItem value="prep-error">Prep Error</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
              <Label>Thrown by *</Label>
              <Select value={formData.thrownBy} onValueChange={(value) => 
                setFormData(prev => ({ ...prev, thrownBy: value }))
              }>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {staffMembers.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Photo *</Label>
              <div className="mt-1">
                <Button onClick={handlePhotoUpload} variant="outline" className="w-full">
                  <Camera className="size-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Photo is required for disposal tracking
                </p>
              </div>
            </div>

            <div>
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details about the disposal..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveDisposal}>
              Save Disposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disposal Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          {selectedDisposal && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedDisposal.item}</DialogTitle>
                <DialogDescription>
                  {selectedDisposal.date} • {formatTime(selectedDisposal.time)} • {selectedDisposal.station}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {selectedDisposal.photo && (
                  <div className="aspect-[3/2] rounded-lg overflow-hidden bg-muted">
                    <img src={selectedDisposal.photo} alt={selectedDisposal.item} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Quantity</Label>
                    <div className="font-semibold mt-1">
                      {selectedDisposal.quantity} {selectedDisposal.unit}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm text-muted-foreground">Reason</Label>
                    <div className="mt-1">
                      <Badge variant={getReasonColor(selectedDisposal.reason)}>
                        {getReasonLabel(selectedDisposal.reason)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Thrown by</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Avatar className="size-6">
                      <AvatarImage src={getUserById(selectedDisposal.thrownBy)?.photo} />
                      <AvatarFallback className="text-xs">
                        {getUserById(selectedDisposal.thrownBy)?.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span>{getUserById(selectedDisposal.thrownBy)?.name}</span>
                  </div>
                </div>

                {selectedDisposal.notes && (
                  <div>
                    <Label className="text-sm text-muted-foreground">Notes</Label>
                    <p className="mt-1 text-sm">{selectedDisposal.notes}</p>
                  </div>
                )}
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
    </>
  );
}