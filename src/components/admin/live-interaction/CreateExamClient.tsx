
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { User, FileQuestion, Settings, Check, XCircle, Trash2, Plus, Download, Upload } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { InteractionQuestion } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import * as XLSX from 'xlsx';


const STEPS = [
    { id: 1, name: 'Basic Info', icon: Settings },
    { id: 2, name: 'Questions', icon: FileQuestion },
    { id: 3, name: 'Review', icon: Check },
];

const participantFields = [
    { id: 'name', label: 'Participant Name', required: true },
    { id: 'participantId', label: 'Participant ID', required: false },
    { id: 'organization', label: 'Organization', required: false },
    { id: 'mobile', label: 'Mobile Number', required: false },
    { id: 'email', label: 'Email', required: false },
    { id: 'location', label: 'Location', required: false },
];


export function CreateExamClient() {
    const [step, setStep] = useState(1);
    const [examName, setExamName] = useState('');
    const [requiredFields, setRequiredFields] = useState<Record<string, boolean>>({
        name: true,
        participantId: false,
        organization: false,
        mobile: false,
        email: false,
        location: false,
    });
    const [questions, setQuestions] = useState<InteractionQuestion[]>([]);
    
    const handleFieldToggle = (fieldId: string) => {
        setRequiredFields(prev => ({
            ...prev,
            [fieldId]: !prev[fieldId],
        }));
    };
    
    // Question management functions
    const addQuestion = () => {
        setQuestions(prev => [...prev, {
            id: uuidv4(),
            text: '',
            type: 'multiple-choice',
            options: [{ id: uuidv4(), text: ''}, { id: uuidv4(), text: '' }],
            duration: 30,
            correctOptionId: undefined,
        }]);
    };
    
    const updateQuestion = (id: string, field: keyof InteractionQuestion, value: any) => {
        setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q));
    };

    const deleteQuestion = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
    };

    const addOption = (questionId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                return { ...q, options: [...(q.options || []), { id: uuidv4(), text: '' }] };
            }
            return q;
        }));
    };
    
    const updateOption = (questionId: string, optionId: string, text: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                return { ...q, options: q.options?.map(opt => opt.id === optionId ? { ...opt, text } : opt) };
            }
            return q;
        }));
    };

    const removeOption = (questionId: string, optionId: string) => {
        setQuestions(prev => prev.map(q => {
            if (q.id === questionId) {
                const updatedOptions = q.options?.filter(opt => opt.id !== optionId);
                const updatedQuestion = { ...q, options: updatedOptions };
                // If the removed option was the correct one, unset it
                if (q.correctOptionId === optionId) {
                    updatedQuestion.correctOptionId = undefined;
                }
                return updatedQuestion;
            }
            return q;
        }));
    };

    const handleDownloadFormat = () => {
        const headers = ["questionText", "durationSeconds", "option1", "option2", "option3", "option4", "correctAnswer (1-4)"];
        const exampleData = [
          { questionText: "What is the capital of France?", durationSeconds: 20, option1: "Berlin", option2: "Madrid", option3: "Paris", option4: "Rome", "correctAnswer (1-4)": 3 },
        ];
        const ws = XLSX.utils.json_to_sheet(exampleData, { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "ExamQuestions");
        XLSX.writeFile(wb, "exam_questions_format.xlsx");
      };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];

            const newQuestions: InteractionQuestion[] = [];
            let errors: string[] = [];

            json.forEach((row: any, index) => {
              const { questionText, durationSeconds, "correctAnswer (1-4)": correctIdx } = row;

              if (!questionText || !durationSeconds || !correctIdx) {
                errors.push(`Row ${index + 2}: Missing required fields.`);
                return;
              }
              
              const options = [row.option1, row.option2, row.option3, row.option4]
                .filter(opt => opt != null)
                .map(optText => ({ id: uuidv4(), text: String(optText) }));
                
              if (options.length < 2) {
                  errors.push(`Row ${index + 2}: At least 2 options are required.`);
                  return;
              }

              const correctOptionIndex = parseInt(correctIdx, 10) - 1;
              if (isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
                  errors.push(`Row ${index + 2}: Invalid correct answer index.`);
                  return;
              }

              newQuestions.push({
                id: uuidv4(),
                text: questionText,
                type: 'multiple-choice',
                duration: parseInt(durationSeconds, 10),
                options: options,
                correctOptionId: options[correctOptionIndex].id,
              });
            });
            
            setQuestions(prev => [...prev, ...newQuestions]);
            alert(`${newQuestions.length} questions uploaded successfully.${errors.length > 0 ? `\n\nErrors:\n${errors.join('\n')}` : ''}`);

          } catch (error) {
            console.error("Error processing file:", error);
            alert("Failed to process the uploaded file. Please ensure it is a valid Excel file.");
          } finally {
            event.target.value = '';
          }
        };
        reader.readAsArrayBuffer(file);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));


    return (
        <div className="space-y-6">
            <div className="flex items-center justify-center">
                {STEPS.map((s, index) => (
                    <React.Fragment key={s.id}>
                        <div className="flex flex-col items-center gap-2">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2",
                                step >= s.id ? 'bg-primary border-primary text-primary-foreground' : 'bg-muted'
                            )}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <p className={cn("text-sm", step >= s.id ? 'font-semibold' : 'text-muted-foreground')}>{s.name}</p>
                        </div>
                        {index < STEPS.length - 1 && <div className={cn("flex-1 h-0.5 mx-4", step > s.id ? 'bg-primary' : 'bg-border')} />}
                    </React.Fragment>
                ))}
            </div>

            {step === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Step 1: Basic Information & Participant Fields</CardTitle>
                        <CardDescription>Give your exam a name and configure the information you need to collect from participants.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label htmlFor="examName">Exam Name</Label>
                            <Input 
                                id="examName" 
                                placeholder="e.g., Annual Sales Kick-off Exam"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Participant Information</Label>
                            <p className="text-sm text-muted-foreground">Select which fields are required for participants to enter before starting the exam.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                {participantFields.map(field => (
                                    <div key={field.id} className="flex items-center justify-between space-x-2 rounded-lg border p-3">
                                        <Label htmlFor={field.id} className="font-normal">{field.label}</Label>
                                        <Switch 
                                            id={field.id} 
                                            checked={requiredFields[field.id] || false}
                                            onCheckedChange={() => handleFieldToggle(field.id)}
                                            disabled={field.required}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
            
            {step === 2 && (
                 <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Step 2: Add Questions</CardTitle>
                                <CardDescription>Define the questions for your exam.</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleDownloadFormat} variant="outline" size="sm"><Download className="mr-2 h-4 w-4"/>Format</Button>
                                <Button asChild variant="outline" size="sm">
                                    <Label className="cursor-pointer flex items-center">
                                        <Upload className="mr-2 h-4 w-4"/>Upload
                                        <Input type="file" className="hidden" accept=".csv, .xlsx" onChange={handleFileUpload}/>
                                    </Label>
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       {questions.map((q, qIndex) => (
                           <Card key={q.id} className="p-4">
                               <div className="flex justify-between items-start">
                                   <div className="flex-grow space-y-2">
                                        <Label htmlFor={`q-text-${q.id}`}>Question {qIndex + 1}</Label>
                                        <Input id={`q-text-${q.id}`} value={q.text} onChange={e => updateQuestion(q.id, 'text', e.target.value)} placeholder="Enter question text..." />
                                   </div>
                                   <div className="ml-4 flex-shrink-0 w-32">
                                        <Label htmlFor={`q-duration-${q.id}`}>Duration (s)</Label>
                                        <Input id={`q-duration-${q.id}`} type="number" value={q.duration} onChange={e => updateQuestion(q.id, 'duration', parseInt(e.target.value, 10))} />
                                   </div>
                                   <Button variant="ghost" size="icon" className="ml-2" onClick={() => deleteQuestion(q.id)}>
                                       <Trash2 className="h-4 w-4 text-destructive"/>
                                   </Button>
                               </div>
                               <div className="mt-4">
                                   <Label>Options</Label>
                                   <RadioGroup value={q.correctOptionId} onValueChange={(value) => updateQuestion(q.id, 'correctOptionId', value)}>
                                        {(q.options || []).map(opt => (
                                            <div key={opt.id} className="flex items-center gap-2 mt-2">
                                                <RadioGroupItem value={opt.id} id={`opt-${opt.id}`} />
                                                <Input value={opt.text} onChange={e => updateOption(q.id, opt.id, e.target.value)} placeholder={`Option ${q.options?.indexOf(opt)! + 1}`} />
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeOption(q.id, opt.id)} disabled={(q.options?.length || 0) <= 2}>
                                                    <XCircle className="h-4 w-4 text-destructive"/>
                                                </Button>
                                            </div>
                                        ))}
                                   </RadioGroup>
                                   <Button variant="outline" size="sm" className="mt-2" onClick={() => addOption(q.id)}>
                                        <Plus className="mr-2 h-4 w-4"/> Add Option
                                   </Button>
                               </div>
                           </Card>
                       ))}
                       <Button onClick={addQuestion} className="w-full">
                           <Plus className="mr-2 h-4 w-4"/> Add Question
                       </Button>
                    </CardContent>
                </Card>
            )}

            {step === 3 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Step 3: Review & Save</CardTitle>
                        <CardDescription>Review all the settings and questions before saving the exam. This feature is coming soon.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground p-8">Review details will be available here.</p>
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep} disabled={step === 1}>Previous</Button>
                {step < STEPS.length ? (
                    <Button onClick={nextStep}>Next</Button>
                ) : (
                    <Button>Save Exam</Button>
                )}
            </div>
        </div>
    );
}
