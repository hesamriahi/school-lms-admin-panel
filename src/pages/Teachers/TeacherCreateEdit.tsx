import { useState, useEffect, useMemo } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ApiRequest, { ApiResponse } from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";

type MediaDisplay = {
  id?: number;
  url?: string;
  conversions?: { sm?: string; md?: string; lg?: string };
};

function mediaUrl(media?: MediaDisplay | null) {
  return media?.conversions?.sm || media?.url || "";
}

export default function TeacherCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = id ? true : false;
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [teacher, setTeacher] = useState({
    name: "",
    resume: "",
    link: "",
    is_active: true,
    show_in_mentors_list: true,
    priority: 1,
    short_description: "",
    image: null as MediaDisplay | null,
    images: [] as MediaDisplay[],
    video: null as MediaDisplay | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call("api/admin/teachers/" + id, "GET").then((response) => {
        const data = response.data.teacher;
        setTeacher({
          name: data.name ?? "",
          resume: data.resume ?? "",
          link: data.link ?? "",
          is_active: Boolean(Number(data.is_active)),
          show_in_mentors_list: Boolean(Number(data.show_in_mentors_list)),
          priority: data.priority ?? 1,
          short_description: data.short_description ?? "",
          image: data.image ?? null,
          images: data.images ?? [],
          video: data.video ?? null,
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode]);

  const handleSubmit = async () => {
    if (!teacher.name) {
      ToastrNotification.error("نام استاد را وارد کنید");
      return;
    }
    if (!teacher.resume) {
      ToastrNotification.error("رزومه را وارد کنید");
      return;
    }
    if (!isUpdateMode && !imageFile) {
      ToastrNotification.error("تصویر استاد الزامی است");
      return;
    }

    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile || videoFile || galleryFiles.length > 0);
      const payload: Record<string, any> = {
        name: teacher.name,
        resume: teacher.resume,
        link: teacher.link,
        is_active: teacher.is_active ? 1 : 0,
        show_in_mentors_list: teacher.show_in_mentors_list ? 1 : 0,
        priority: teacher.priority,
        short_description: teacher.short_description,
      };

      if (imageFile) payload.image = imageFile;
      if (videoFile) payload.video = videoFile;
      if (galleryFiles.length > 0) payload["images[]"] = galleryFiles;
      if (isUpdateMode && hasFiles) payload._method = "PUT";

      const response: ApiResponse = await ApiRequest.call(
        isUpdateMode ? "api/admin/teachers/" + id : "api/admin/teachers",
        isUpdateMode && !hasFiles ? "PUT" : "POST",
        payload,
        null,
        true,
        true,
        hasFiles
      );

      if (response.success) {
        navigate(ROUTES.teacherIndex);
      } else {
        ToastrNotification.error(response.message || "خطا در ذخیره استاد");
      }
    } catch (error) {
      console.log("error in TeacherCreateEdit. on sending message. error: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : mediaUrl(teacher.image)),
    [imageFile, teacher.image]
  );
  const currentVideoUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : teacher.video?.url || ""),
    [videoFile, teacher.video]
  );

  useEffect(() => {
    return () => {
      if (imageFile && currentImageUrl.startsWith("blob:")) URL.revokeObjectURL(currentImageUrl);
      if (videoFile && currentVideoUrl.startsWith("blob:")) URL.revokeObjectURL(currentVideoUrl);
    };
  }, [imageFile, videoFile, currentImageUrl, currentVideoUrl]);

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش استاد" : "ایجاد استاد جدید"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش استاد" : "ایجاد استاد جدید"} />
      <ComponentCard title="اطلاعات استاد">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label htmlFor="teacher.name">نام</Label>
            <Input
              type="text"
              id="teacher.name"
              name="teacher.name"
              placeholder="نام استاد را وارد کنید"
              value={teacher.name}
              onChange={(e) => setTeacher({ ...teacher, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="teacher.link">لینک</Label>
            <Input
              type="text"
              id="teacher.link"
              name="teacher.link"
              placeholder="مثلا google.com"
              value={teacher.link}
              onChange={(e) => setTeacher({ ...teacher, link: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="teacher.priority">اولویت</Label>
            <Input
              type="number"
              id="teacher.priority"
              name="teacher.priority"
              placeholder="اولویت نمایش"
              value={teacher.priority}
              onChange={(e) => setTeacher({ ...teacher, priority: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div>
            <Label htmlFor="teacher.short_description">توضیح کوتاه</Label>
            <Input
              type="text"
              id="teacher.short_description"
              name="teacher.short_description"
              placeholder="توضیح کوتاه را وارد کنید"
              value={teacher.short_description}
              onChange={(e) => setTeacher({ ...teacher, short_description: e.target.value })}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="teacher.resume">رزومه</Label>
            <TextArea
              placeholder="رزومه استاد را وارد کنید"
              rows={6}
              value={teacher.resume}
              onChange={(value) => setTeacher({ ...teacher, resume: value })}
            />
          </div>
          <div>
            <Label htmlFor="teacher.image">{isUpdateMode ? "تصویر (اختیاری)" : "تصویر"}</Label>
            {currentImageUrl && (
              <img src={currentImageUrl} alt={teacher.name} className="mb-3 h-20 w-20 rounded-lg object-cover" />
            )}
            <FileInput
              accept="image/jpeg,image/png,image/jpg,image/webp"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-gray-400">jpeg، png، jpg یا webp — حداکثر ۱ مگابایت</p>
          </div>
          <div>
            <Label htmlFor="teacher.video">ویدیو</Label>
            {currentVideoUrl && (
              <video src={currentVideoUrl} className="mb-3 h-20 w-32 rounded-lg object-cover" controls />
            )}
            <FileInput
              accept="video/mp4,video/mpeg,video/webm,video/x-m4v"
              onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            />
            <p className="mt-1 text-xs text-gray-400">mp4، mpeg، webm یا mkv — حداکثر ۵۰ مگابایت</p>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="teacher.images">گالری تصاویر</Label>
            {teacher.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {teacher.images.map((img, index) => (
                  <img key={img.id ?? index} src={mediaUrl(img)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            )}
            {galleryFiles.length > 0 && (
              <p className="mb-2 text-xs text-gray-500">{galleryFiles.length} فایل جدید انتخاب شده</p>
            )}
            <FileInput
              accept="image/jpeg,image/png,image/jpg,image/webp"
              multiple
              onChange={(e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </div>
          {isLoaded && (
            <>
              <div>
                <Label htmlFor="teacher.is_active">وضعیت فعال</Label>
                <div className="mt-2">
                  <Switch
                    key={`is_active-${teacher.is_active}`}
                    label="استاد فعال است"
                    defaultChecked={teacher.is_active}
                    onChange={(checked) => setTeacher({ ...teacher, is_active: checked })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="teacher.show_in_mentors_list">نمایش در صفحه اصلی</Label>
                <div className="mt-2">
                  <Switch
                    key={`show_in_mentors_list-${teacher.show_in_mentors_list}`}
                    label="در لیست منتورها نمایش داده شود"
                    defaultChecked={teacher.show_in_mentors_list}
                    onChange={(checked) => setTeacher({ ...teacher, show_in_mentors_list: checked })}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="success" size="md" onClick={handleSubmit} disabled={isSubmitting} type="button">
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
