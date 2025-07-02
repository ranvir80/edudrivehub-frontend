import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Subject, Chapter } from "@shared/schema";

interface ChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: Subject;
}

export default function ChapterModal({ isOpen, onClose, subject }: ChapterModalProps) {
  const { data: chapters = [], isLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/chapters", subject.name],
    enabled: isOpen,
  });

  const handleDownload = (pdfUrl: string, chapterTitle: string) => {
    // In a real implementation, this would handle the PDF download
    window.open(pdfUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <i className={`${subject.icon} text-primary`}></i>
            <span>{subject.name}</span>
          </DialogTitle>
          <p className="text-sm text-neutral-700">Available chapters and materials</p>
        </DialogHeader>
        
        <ScrollArea className="max-h-96 pr-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-24"></div>
                </div>
              ))}
            </div>
          ) : chapters.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-file-pdf text-neutral-400 text-4xl mb-4"></i>
              <p className="text-neutral-600">No chapters available for this subject yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chapters.map((chapter) => (
                <div
                  key={chapter.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i className="fas fa-file-pdf text-blue-600"></i>
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{chapter.chapterTitle}</h4>
                      <p className="text-sm text-neutral-600">
                        Uploaded {new Date(chapter.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleDownload(chapter.pdfUrl, chapter.chapterTitle)}
                    className="bg-primary hover:bg-blue-700"
                  >
                    <i className="fas fa-download mr-2"></i>Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
