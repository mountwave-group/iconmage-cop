import { useRef, useState } from 'react'
import { Button, useToast } from '../../components/ui'
import { storageApi, type FileVisibility } from '../../api/resources'
import { ApiError } from '../../api/client'

const ACCEPTED = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'image/png',
  'image/jpeg',
  'video/mp4',
] as const

const MAX_BYTES = 1_073_741_824 // 1 GB

interface Props {
  projectId?: string
  clientId?: string
  visibility?: FileVisibility
  onUploaded?: () => void
}

export function FileUploader({ projectId, clientId, visibility = 'PM', onUploaded }: Props) {
  const toast = useToast()
  const ref = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const upload = async (file: File) => {
    if (!ACCEPTED.includes(file.type as (typeof ACCEPTED)[number])) {
      toast.error('Unsupported file type.', 'PDF · DOCX · ZIP · PNG · JPEG · MP4 only.')
      return
    }
    if (file.size > MAX_BYTES) {
      toast.error('File too large.', 'Maximum 1 GB per file.')
      return
    }
    setBusy(true)
    setProgress(0)
    try {
      const presign = await storageApi.presignUpload({
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
        projectId,
        clientId,
        visibility,
      })

      // Upload via XHR so we can report progress.
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', presign.uploadUrl)
        xhr.setRequestHeader('content-type', file.type)
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`S3 upload failed (${xhr.status}).`))
        }
        xhr.onerror = () => reject(new Error('Network error during upload.'))
        xhr.send(file)
      })

      toast.success('File uploaded.', file.name)
      onUploaded?.()
    } catch (err) {
      toast.error('Upload failed.', err instanceof ApiError ? err.message : (err as Error).message)
    } finally {
      setBusy(false)
      setProgress(null)
      if (ref.current) ref.current.value = ''
    }
  }

  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void upload(file)
        }}
      />
      <Button variant="secondary" onClick={() => ref.current?.click()} loading={busy}>
        {busy && progress != null ? `Uploading ${progress}%` : 'Upload file'}
      </Button>
    </div>
  )
}
