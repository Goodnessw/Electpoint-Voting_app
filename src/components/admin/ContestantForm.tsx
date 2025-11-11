import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload } from "lucide-react";

interface ContestantFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contestant?: {
    id: string;
    name: string;
    tagline: string | null;
    bio: string | null;
    achievements: string | null;
    vision: string | null;
    photo_url: string | null;
    video_url: string | null;
  } | null;
}

export const ContestantForm = ({ open, onClose, onSuccess, contestant }: ContestantFormProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    bio: "",
    achievements: "",
    vision: "",
    video_url: "",
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");

  useEffect(() => {
    if (contestant) {
      setFormData({
        name: contestant.name,
        tagline: contestant.tagline || "",
        bio: contestant.bio || "",
        achievements: contestant.achievements || "",
        vision: contestant.vision || "",
        video_url: contestant.video_url || "",
      });
      setPhotoPreview(contestant.photo_url || "");
    } else {
      setFormData({
        name: "",
        tagline: "",
        bio: "",
        achievements: "",
        vision: "",
        video_url: "",
      });
      setPhotoPreview("");
    }
    setPhotoFile(null);
  }, [contestant, open]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const uploadPhoto = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("contestant-photos")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data } = supabase.storage.from("contestant-photos").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let photoUrl = contestant?.photo_url;

    if (photoFile) {
      const uploadedUrl = await uploadPhoto(photoFile);
      if (uploadedUrl) {
        photoUrl = uploadedUrl;
      } else {
        toast.error("Failed to upload photo");
        setLoading(false);
        return;
      }
    }

    const payload = {
      ...formData,
      photo_url: photoUrl,
    };

    if (contestant) {
      const { error } = await supabase
        .from("contestants")
        .update(payload)
        .eq("id", contestant.id);

      if (error) {
        toast.error("Failed to update contestant");
        console.error(error);
      } else {
        toast.success("Contestant updated successfully");
        onSuccess();
      }
    } else {
      const { error } = await supabase.from("contestants").insert(payload);

      if (error) {
        toast.error("Failed to add contestant");
        console.error(error);
      } else {
        toast.success("Contestant added successfully");
        onSuccess();
      }
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{contestant ? "Edit Contestant" : "Add New Contestant"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="photo">Photo</Label>
            <div className="flex items-center gap-4">
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-20 h-20 rounded-full object-cover ring-2 ring-primary/20"
                />
              )}
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="flex-1"
              />
              <Upload className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="achievements">Achievements</Label>
            <Textarea
              id="achievements"
              rows={3}
              value={formData.achievements}
              onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vision">Vision</Label>
            <Textarea
              id="vision"
              rows={3}
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">Video URL (optional)</Label>
            <Input
              id="video_url"
              type="url"
              placeholder="https://youtube.com/embed/..."
              value={formData.video_url}
              onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-primary hover:opacity-90">
              {loading ? "Saving..." : contestant ? "Update" : "Add Contestant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
