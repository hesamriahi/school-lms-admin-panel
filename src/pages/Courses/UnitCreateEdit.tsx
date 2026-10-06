import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { MediaDisplay, mediaUrl, submitAdminResource } from "../../utils/adminForm";

export default function UnitCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id: courseId, unitId } = useParams();
  const isUpdateMode = Boolean(unitId);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [form, setForm] = useState({
    title: "",
    en_title: "",
    duration: 0,
    priority: 1,
    is_private: false,
    is_active: true,
    meta_title: "",
    meta_description: "",
    slug: "",
    main_image: null as MediaDisplay | null,
    video: null as MediaDisplay | null,
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call(`api/admin/courses/${courseId}/units/${unitId}`, "GET").then((response) => {
        const data = response.data.unit;
        setForm({
          title: data.title ?? "",
          en_title: data.en_title ?? "",
          duration: data.duration ?? 0,
          priority: data.priority ?? 1,
          is_private: Boolean(Number(data.is_private)),
          is_active: Boolean(Number(data.is_active)),
          meta_title: data.meta_title ?? "",
          meta_description: data.meta_description ?? "",
          slug: data.slug ?? "",
          main_image: data.main_image ?? null,
          video: data.video ?? null,
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, courseId, unitId]);

  const handleSubmit = async () => {
    if (!form.title || !form.en_title) {
      ToastrNotification.error("عنوان فارسی و انگلیسی الزامی است");
      return;
    }
    if (!isUpdateMode && !mainImageFile) {
      ToastrNotification.error("تصویر اصلی درس الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(mainImageFile || videoFile || fileUploads.length);
      const payload: Record<string, any> = {
        title: form.title,
        en_title: form.en_title,
        duration: form.duration,
        priority: form.priority,
        is_private: form.is_private ? 1 : 0,
        is_active: form.is_active ? 1 : 0,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        slug: form.slug,
      };
      if (mainImageFile) payload.main_image = mainImageFile;
      if (videoFile) payload.video = videoFile;
      if (fileUploads.length) payload["files[]"] = fileUploads;
      const response = await submitAdminResource(
        isUpdateMode ? `api/admin/courses/${courseId}/units/${unitId}` : `api/admin/courses/${courseId}/units`,
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.courseUnitsIndex.replace(":id", String(courseId)));
      else ToastrNotification.error(response.message || "خطا در ذخیره درس");
    } catch (error) {
      console.log("error in UnitCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (mainImageFile ? URL.createObjectURL(mainImageFile) : mediaUrl(form.main_image)),
    [mainImageFile, form.main_image]
  );
  const currentVideoUrl = useMemo(
    () => (videoFile ? URL.createObjectURL(videoFile) : form.video?.url || ""),
    [videoFile, form.video]
  );

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش درس" : "ایجاد درس"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش درس" : "ایجاد درس"} />
      <ComponentCard title="اطلاعات درس">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>عنوان انگلیسی</Label>
            <Input value={form.en_title} onChange={(e) => setForm({ ...form, en_title: e.target.value })} />
          </div>
          <div>
            <Label>مدت (دقیقه)</Label>
            <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>اولویت</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>اسلاگ</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div>
            <Label>متا عنوان</Label>
            <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>متا توضیحات</Label>
            <Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          </div>
          <div>
            <Label>{isUpdateMode ? "تصویر اصلی (اختیاری)" : "تصویر اصلی"}</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-20 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setMainImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label>ویدیو</Label>
            {currentVideoUrl && <video src={currentVideoUrl} className="mb-3 h-20 w-32 rounded-lg object-cover" controls />}
            <FileInput accept="video/mp4,video/mpeg,video/webm" onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label>فایل‌ها</Label>
            <FileInput multiple onChange={(e) => setFileUploads(e.target.files ? Array.from(e.target.files) : [])} />
          </div>
          {isLoaded && (
            <>
              <div>
                <Label>خصوصی</Label>
                <div className="mt-2">
                  <Switch
                    key={`is_private-${form.is_private}`}
                    label="درس خصوصی است"
                    defaultChecked={form.is_private}
                    onChange={(checked) => setForm({ ...form, is_private: checked })}
                  />
                </div>
              </div>
              <div>
                <Label>وضعیت فعال</Label>
                <div className="mt-2">
                  <Switch
                    key={`is_active-${form.is_active}`}
                    label="درس فعال است"
                    defaultChecked={form.is_active}
                    onChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="success" size="md" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </div>
      </ComponentCard>
    </div>
  );
}
