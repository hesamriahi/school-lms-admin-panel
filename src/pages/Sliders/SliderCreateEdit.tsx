import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Button from "../../components/ui/button/Button";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { MediaDisplay, mediaUrl, submitAdminResource } from "../../utils/adminForm";

export default function SliderCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [form, setForm] = useState({
    title: "",
    description: "",
    group: "",
    priority: 1,
    is_active: true,
    link: "",
    image: null as MediaDisplay | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isUpdateMode) {
      ApiRequest.call("api/admin/sliders/" + id, "GET").then((response) => {
        const data = response.data.slider;
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          group: data.group ?? "",
          priority: data.priority ?? 1,
          is_active: Boolean(Number(data.is_active)),
          link: data.link ?? "",
          image: data.image ?? null,
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.title || !form.group) {
      ToastrNotification.error("عنوان و گروه الزامی است");
      return;
    }
    if (!isUpdateMode && !imageFile) {
      ToastrNotification.error("تصویر اسلایدر الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile);
      const payload: Record<string, any> = {
        title: form.title,
        description: form.description,
        group: form.group,
        priority: form.priority,
        is_active: form.is_active ? 1 : 0,
        link: form.link,
      };
      if (imageFile) payload.image = imageFile;
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/sliders/" + id : "api/admin/sliders",
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.sliderIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره اسلایدر");
    } catch (error) {
      console.log("error in SliderCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (imageFile ? URL.createObjectURL(imageFile) : mediaUrl(form.image)),
    [imageFile, form.image]
  );

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش اسلایدر" : "ایجاد اسلایدر"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش اسلایدر" : "ایجاد اسلایدر"} />
      <ComponentCard title="اطلاعات اسلایدر">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label>گروه</Label>
            <Input value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} placeholder="مثلا home" />
          </div>
          <div>
            <Label>لینک</Label>
            <Input value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </div>
          <div>
            <Label>اولویت</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="md:col-span-2">
            <Label>توضیحات</Label>
            <TextArea rows={4} value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          </div>
          <div>
            <Label>{isUpdateMode ? "تصویر (اختیاری)" : "تصویر"}</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-32 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="اسلایدر فعال است"
                  defaultChecked={form.is_active}
                  onChange={(checked) => setForm({ ...form, is_active: checked })}
                />
              </div>
            </div>
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
