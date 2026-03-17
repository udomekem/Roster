'use client'

import { useState, useRef, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, File as FileIcon, Image as ImageIcon } from 'lucide-react'

interface FileUploadProps {
  label?: string
  accept?: string
  maxSizeMB?: number
  maxFiles?: number
  files: File[]
  onChange: (files: File[]) => void
  className?: string
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <ImageIcon className="h-4 w-4 text-blue-500" />
  return <FileIcon className="h-4 w-4 text-gray-500" />
}

export function FileUpload({
  label = 'Attachments',
  accept,
  maxSizeMB = 10,
  maxFiles = 5,
  files,
  onChange,
  className,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function validateFiles(newFiles: FileList | File[]): File[] {
    const maxBytes = maxSizeMB * 1024 * 1024
    const accepted: File[] = []

    for (const file of Array.from(newFiles)) {
      if (file.size > maxBytes) {
        setError(`"${file.name}" exceeds ${maxSizeMB}MB limit`)
        continue
      }
      accepted.push(file)
    }

    const total = files.length + accepted.length
    if (total > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return accepted.slice(0, maxFiles - files.length)
    }

    return accepted
  }

  function handleFiles(newFiles: FileList | null) {
    if (!newFiles) return
    setError(null)
    const validated = validateFiles(newFiles)
    if (validated.length) {
      onChange([...files, ...validated])
    }
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    handleFiles(e.target.files)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleDrag(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFiles(e.dataTransfer.files)
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
    setError(null)
  }

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-6 transition-colors',
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50',
          files.length >= maxFiles && 'pointer-events-none opacity-50'
        )}
      >
        <Upload className="mb-2 h-6 w-6 text-gray-400" />
        <p className="text-sm text-gray-600">
          <span className="font-medium text-blue-600">Click to upload</span> or
          drag and drop
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Max {maxSizeMB}MB per file · Up to {maxFiles} files
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleChange}
        className="hidden"
      />

      {error && (
        <p className="mt-1.5 text-sm text-red-600">{error}</p>
      )}

      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className="flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {getFileIcon(file.type)}
                <span className="truncate text-sm text-gray-700">{file.name}</span>
                <span className="flex-shrink-0 text-xs text-gray-400">
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(index)
                }}
                className="ml-2 flex-shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
