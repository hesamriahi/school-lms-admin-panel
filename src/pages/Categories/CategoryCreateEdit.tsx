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
import { MediaDisplay, mediaUrl, rowsFrom, selectClassName, submitAdminResource } from "../../utils/adminForm";

export default function CategoryCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [parents, setParents] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    en_title: "",
    parent_id: "",
    priority: 1,
    slug: "",
    is_active: true,
    image: null as MediaDisplay | null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ApiRequest.call("api/admin/categories", "GET").then((response) => {
      setParents(rowsFrom(response, "categories").filter((item) => String(item.id) !== String(id)));
    });
    if (isUpdateMode) {
      ApiRequest.call("api/admin/categories/" + id, "GET").then((response) => {
        const data = response.data.category;
        setForm({
          title: data.title ?? "",
          en_title: data.en_title ?? "",
          parent_id: data.parent_id ? String(data.parent_id) : "",
          priority: data.priority ?? 1,
          slug: data.slug ?? "",
          is_active: Boolean(Number(data.is_active)),
          image: data.image ?? null,
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const handleSubmit = async () => {
    if (!form.title || !form.en_title) {
      ToastrNotification.error("عنوان فارسی و انگلیسی الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(imageFile);
      const payload: Record<string, any> = {
        title: form.title,
        en_title: form.en_title,
        parent_id: form.parent_id || null,
        priority: form.priority,
        slug: form.slug || form.en_title,
        is_active: form.is_active ? 1 : 0,
      };
      if (imageFile) payload.image = imageFile;
      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/categories/" + id : "api/admin/categories",
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.categoryIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره دسته‌بندی");
    } catch (error) {
      console.log("error in CategoryCreateEdit", error);
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
      <PageMeta title={isUpdateMode ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش دسته‌بندی" : "ایجاد دسته‌بندی"} />
      <ComponentCard title="اطلاعات دسته‌بندی">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <Label>عنوان</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="عنوان فارسی" />
          </div>
          <div>
            <Label>عنوان انگلیسی</Label>
            <Input value={form.en_title} onChange={(e) => setForm({ ...form, en_title: e.target.value })} placeholder="English title" />
          </div>
          <div>
            <Label>دسته‌بندی والد</Label>
            <select className={selectClassName} value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
              <option value="">بدون والد</option>
              {parents.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>اولویت</Label>
            <Input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>اسلاگ</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="در صورت خالی بودن از عنوان انگلیسی ساخته می‌شود" />
          </div>
          <div>
            <Label>تصویر</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-20 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)} />
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="دسته‌بندی فعال است"
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
