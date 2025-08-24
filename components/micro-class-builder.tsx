'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PlusCircle, Trash2, Save, BookOpen, Video, FileText, HelpCircle, CheckCircle } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface Lesson {
  id: string
  title: string
  type: 'text' | 'video' | 'quiz' | 'task'
  content: string // For text/video URL/quiz questions/task description
  options?: string[] // For quiz multiple choice
  correctAnswer?: string // For quiz
}

export default function MicroClassBuilder() {
  const [classTitle, setClassTitle] = useState('')
  const [classDescription, setClassDescription] = useState('')
  const [classCategory, setClassCategory] = useState('')
  const [xpReward, setXpReward] = useState('')
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [nextLessonId, setNextLessonId] = useState(1)

  const addLesson = (type: Lesson['type']) => {
    setLessons(prevLessons => [
      ...prevLessons,
      { id: `lesson-${nextLessonId}`, title: '', type, content: '' }
    ])
    setNextLessonId(prevId => prevId + 1)
  }

  const updateLesson = (id: string, field: keyof Lesson, value: any) => {
    setLessons(prevLessons =>
      prevLessons.map(lesson =>
        lesson.id === id ? { ...lesson, [field]: value } : lesson
      )
    )
  }

  const removeLesson = (id: string) => {
    setLessons(prevLessons => prevLessons.filter(lesson => lesson.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!classTitle || !classDescription || !classCategory || !xpReward || lessons.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all class details and add at least one lesson.',
        variant: 'destructive',
      })
      return
    }

    // Basic validation for lessons
    const isValid = lessons.every(lesson => {
      if (!lesson.title || !lesson.content) return false
      if (lesson.type === 'quiz' && (!lesson.options || lesson.options.length < 2 || !lesson.correctAnswer)) return false
      return true
    })

    if (!isValid) {
      toast({
        title: 'Invalid Lesson Details',
        description: 'Please ensure all lessons have a title, content, and correct quiz/task details.',
        variant: 'destructive',
      })
      return
    }

    const newMicroClass = {
      classTitle,
      classDescription,
      classCategory,
      xpReward: parseInt(xpReward),
      lessons,
    }

    console.log('New Micro-Class:', newMicroClass)
    toast({
      title: 'Micro-Class Saved!',
      description: 'Your micro-class has been successfully created and saved.',
      variant: 'success',
    })

    // Reset form
    setClassTitle('')
    setClassDescription('')
    setClassCategory('')
    setXpReward('')
    setLessons([])
    setNextLessonId(1)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <h1 className="text-3xl font-bold">Micro-Class Builder</h1>
      <p className="text-muted-foreground">Create engaging learning modules for the Peerverse community.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Class Details</CardTitle>
            <CardDescription>Provide general information about your micro-class.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="class-title">Title</Label>
              <Input
                id="class-title"
                placeholder="e.g., Introduction to Motoko"
                value={classTitle}
                onChange={(e) => setClassTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="class-description">Description</Label>
              <Textarea
                id="class-description"
                placeholder="A brief overview of what learners will achieve."
                value={classDescription}
                onChange={(e) => setClassDescription(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="class-category">Category</Label>
                <Select value={classCategory} onValueChange={setClassCategory} required>
                  <SelectTrigger id="class-category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blockchain">Blockchain</SelectItem>
                    <SelectItem value="programming">Programming</SelectItem>
                    <SelectItem value="frontend">Frontend Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="data-science">Data Science</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="xp-reward">XP Reward</Label>
                <Input
                  id="xp-reward"
                  type="number"
                  placeholder="e.g., 200"
                  value={xpReward}
                  onChange={(e) => setXpReward(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessons</CardTitle>
            <CardDescription>Add content to your micro-class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="border-l-4 border-primary/60">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Lesson {index + 1}: {lesson.title || `New ${lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} Lesson`}</CardTitle>
                  <Button variant="destructive" size="icon" onClick={() => removeLesson(lesson.id)}>
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Remove lesson</span>
                  </Button>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor={`lesson-title-${lesson.id}`}>Lesson Title</Label>
                    <Input
                      id={`lesson-title-${lesson.id}`}
                      value={lesson.title}
                      onChange={(e) => updateLesson(lesson.id, 'title', e.target.value)}
                      placeholder="e.g., Introduction to Actors"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor={`lesson-type-${lesson.id}`}>Content Type</Label>
                    <Select
                      value={lesson.type}
                      onValueChange={(value: Lesson['type']) => updateLesson(lesson.id, 'type', value)}
                      required
                    >
                      <SelectTrigger id={`lesson-type-${lesson.id}`}>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text Content</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                        <SelectItem value="task">Task</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {lesson.type === 'text' && (
                    <div className="grid gap-2">
                      <Label htmlFor={`lesson-content-${lesson.id}`}>Text Content</Label>
                      <Textarea
                        id={`lesson-content-${lesson.id}`}
                        value={lesson.content}
                        onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                        placeholder="Write your lesson content here..."
                        rows={6}
                        required
                      />
                    </div>
                  )}

                  {lesson.type === 'video' && (
                    <div className="grid gap-2">
                      <Label htmlFor={`lesson-video-url-${lesson.id}`}>Video URL</Label>
                      <Input
                        id={`lesson-video-url-${lesson.id}`}
                        type="url"
                        value={lesson.content}
                        onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                        placeholder="e.g., https://youtube.com/watch?v=..."
                        required
                      />
                    </div>
                  )}

                  {lesson.type === 'quiz' && (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor={`quiz-question-${lesson.id}`}>Quiz Question</Label>
                        <Textarea
                          id={`quiz-question-${lesson.id}`}
                          value={lesson.content}
                          onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                          placeholder="What is the primary purpose of an actor in Motoko?"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Options</Label>
                        {lesson.options?.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...(lesson.options || [])]
                                newOptions[optIndex] = e.target.value
                                updateLesson(lesson.id, 'options', newOptions)
                              }}
                              placeholder={`Option ${optIndex + 1}`}
                              required
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const newOptions = lesson.options?.filter((_, i) => i !== optIndex) || []
                                updateLesson(lesson.id, 'options', newOptions)
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateLesson(lesson.id, 'options', [...(lesson.options || []), ''])}
                        >
                          Add Option
                        </Button>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor={`correct-answer-${lesson.id}`}>Correct Answer (exact match)</Label>
                        <Input
                          id={`correct-answer-${lesson.id}`}
                          value={lesson.correctAnswer || ''}
                          onChange={(e) => updateLesson(lesson.id, 'correctAnswer', e.target.value)}
                          placeholder="Enter the exact correct option text"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {lesson.type === 'task' && (
                    <div className="grid gap-2">
                      <Label htmlFor={`task-description-${lesson.id}`}>Task Description</Label>
                      <Textarea
                        id={`task-description-${lesson.id}`}
                        value={lesson.content}
                        onChange={(e) => updateLesson(lesson.id, 'content', e.target.value)}
                        placeholder="Describe the task for learners to complete."
                        rows={4}
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            <div className="flex flex-wrap gap-4 justify-center">
              <Button type="button" variant="outline" onClick={() => addLesson('text')}>
                <FileText className="h-4 w-4 mr-2" /> Add Text Lesson
              </Button>
              <Button type="button" variant="outline" onClick={() => addLesson('video')}>
                <Video className="h-4 w-4 mr-2" /> Add Video Lesson
              </Button>
              <Button type="button" variant="outline" onClick={() => addLesson('quiz')}>
                <HelpCircle className="h-4 w-4 mr-2" /> Add Quiz
              </Button>
              <Button type="button" variant="outline" onClick={() => addLesson('task')}>
                <CheckCircle className="h-4 w-4 mr-2" /> Add Task
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full">
          <Save className="h-5 w-5 mr-2" /> Save Micro-Class
        </Button>
      </form>
    </div>
  )
}
