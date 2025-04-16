import { useState } from 'react';
import { StudyMaterial } from '@shared/schema';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { loadOfflineMaterials, saveMaterialsOffline } from '../../lib/storageUtils';
import { getFileIcon, isImageFile } from '../../lib/fileUtils';
import { Pencil, Trash2, Download, ExternalLink, FileText } from 'lucide-react';

interface MaterialsListProps {
  materials: StudyMaterial[];
  onEdit: (material: StudyMaterial) => void;
  onDelete: (id: number) => void;
}

export default function MaterialsList({ materials, onEdit, onDelete }: MaterialsListProps) {
  const [expandedMaterial, setExpandedMaterial] = useState<number | null>(null);
  
  const toggleExpand = (id: number) => {
    setExpandedMaterial(expandedMaterial === id ? null : id);
  };
  
  if (materials.length === 0) {
    return (
      <div className="text-center p-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-30 mb-3" />
        <h3 className="text-lg font-medium">No study materials yet</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Add your first study material to get started
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {materials.map((material) => {
        // Extract filename from url or use type as fallback
        const fileName = material.url?.split('/').pop() || `${material.title}.${material.type}`;
        // Check if material is an image type
        const isImage = material.type === 'image' || (material.url && isImageFile(material.url));

        return (
          <Card key={material.id} className="overflow-hidden flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex-1 mr-2 overflow-hidden">
                  <CardTitle className="text-base truncate">{material.title}</CardTitle>
                  <CardDescription className="truncate">
                    {material.category || material.type}
                  </CardDescription>
                </div>
                <div className="text-3xl">
                  {getFileIcon(fileName)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-2 flex-1">
              <p className="text-sm text-muted-foreground">
                {expandedMaterial === material.id 
                  ? (material.fileContent ? 'Has content stored locally' : (material.url ? 'External link' : 'No content'))
                  : (material.fileContent ? 'Has content stored locally' : (material.url ? 'External link' : 'No content'))}
              </p>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.isArray(material.tags) && (material.tags as string[]).map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col items-stretch gap-2 pt-0">
              <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                <span>Added: {formatDate(material.uploadDate)}</span>
                <span>{material.section}</span>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="px-2"
                  onClick={() => toggleExpand(material.id)}
                >
                  {expandedMaterial === material.id ? 'Show less' : 'Show more'}
                </Button>
                
                <div className="flex space-x-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit(material)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="text-destructive hover:text-destructive/80"
                    onClick={() => onDelete(material.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {material.url && (
                    <Button
                      size="icon"
                      variant="ghost"
                      asChild
                    >
                      <a href={material.url} target="_blank" rel="noopener noreferrer">
                        {isImage ? (
                          <ExternalLink className="h-4 w-4" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}