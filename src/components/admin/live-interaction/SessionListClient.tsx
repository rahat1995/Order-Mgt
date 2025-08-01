
'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { InteractionSession } from '@/types';
import { BarChart, Edit, Trash2, QrCode, Presentation } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import QRCode from 'react-qr-code';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function SessionListClient() {
    const { settings, updateInteractionSession, isLoaded } = useSettings();
    const { interactionSessions = [] } = settings;
    const router = useRouter();

    const handleStatusChange = (session: InteractionSession, isActive: boolean) => {
        const newStatus = isActive ? 'active' : 'inactive';
        
        if (isActive) {
            // Deactivate all other sessions
            settings.interactionSessions?.forEach(s => {
                if (s.id !== session.id && s.status === 'active') {
                    updateInteractionSession({ ...s, status: 'inactive' });
                }
            });
        }
        
        updateInteractionSession({ ...session, status: newStatus });
    };
    
    const getJoinUrl = () => {
        if (typeof window !== 'undefined') {
            return `${window.location.origin}/join`;
        }
        return '';
    };

    if (!isLoaded) {
        return <p>Loading sessions...</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Existing Sessions</CardTitle>
                <CardDescription>View, manage, and activate your interaction sessions from here.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Session Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Questions</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {interactionSessions.length > 0 ? (
                            interactionSessions.map(session => (
                                <TableRow key={session.id}>
                                    <TableCell className="font-medium">{session.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="capitalize">{session.type}</Badge>
                                    </TableCell>
                                    <TableCell>{session.questions.length}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Switch 
                                                id={`status-${session.id}`} 
                                                checked={session.status === 'active'}
                                                onCheckedChange={(checked) => handleStatusChange(session, checked)}
                                            />
                                            <label htmlFor={`status-${session.id}`} className={cn("text-sm capitalize", session.status === 'active' && 'font-semibold text-primary')}>{session.status}</label>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right space-x-1">
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/admin/modules/liveAudienceInteraction/sessions/${session.id}/host`)}>
                                            <Presentation className="mr-2 h-4 w-4" /> Host
                                        </Button>
                                        {session.status === 'active' && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" size="icon" className="h-8 w-8">
                                                        <QrCode className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-4">
                                                    <div className="text-center">
                                                        <p className="mb-4 font-semibold">Scan to Join</p>
                                                        <div className="p-2 bg-white rounded-md">
                                                            <QRCode value={getJoinUrl()} size={128} />
                                                        </div>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}
                                        <Button variant="ghost" size="icon" disabled>
                                            <BarChart className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" disabled>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" disabled>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No sessions created yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
