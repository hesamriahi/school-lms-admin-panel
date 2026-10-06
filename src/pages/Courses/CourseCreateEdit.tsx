import { useEffect, useMemo, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import FileInput from "../../components/form/input/FileInput";
import Switch from "../../components/form/switch/Switch";
import Checkbox from "../../components/form/input/Checkbox";
import Button from "../../components/ui/button/Button";
import SearchableDropDownList from "../../components/common/SearchableDropDownList";
import ApiRequest from "../../classes/ApiRequest";
import ToastrNotification from "../../classes/ToastrNotification";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ROUTES } from "../../routes";
import { Permission } from "../../classes/Permission.ts";
import { MediaDisplay, mediaUrl, rowsFrom, selectClassName, submitAdminResource } from "../../utils/adminForm";

export default function CourseCreateEdit() {
  if (Permission.check(["super_admin"]) === false) return <Navigate to={ROUTES.home} replace />;

  const { id } = useParams();
  const isUpdateMode = Boolean(id);
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(!isUpdateMode);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    title: "",
    en_title: "",
    status: "draft",
    description: "",
    teacher_id: "" as string | number,
    teacher_name: "",
    duration: 0,
    meta_title: "",
    meta_description: "",
    unit_price: 0,
    discount: 0,
    discount_type: "flat",
    capacity: 0,
    rate: 0,
    is_active: true,
    slug: "",
    category_ids: [] as number[],
    main_image: null as MediaDisplay | null,
    images: [] as MediaDisplay[],
  });
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    ApiRequest.call("api/admin/categories", "GET").then((response) => setCategories(rowsFrom(response, "categories")));
    if (isUpdateMode) {
      ApiRequest.call("api/admin/courses/" + id, "GET").then((response) => {
        const data = response.data.course;
        setForm({
          title: data.title ?? "",
          en_title: data.en_title ?? "",
          status: data.status ?? "draft",
          description: data.description ?? "",
          teacher_id: data.teacher_id ?? "",
          teacher_name: data.teacher?.name ?? "",
          duration: data.duration ?? 0,
          meta_title: data.meta_title ?? "",
          meta_description: data.meta_description ?? "",
          unit_price: data.unit_price ?? 0,
          discount: data.discount ?? 0,
          discount_type: data.discount_type ?? "flat",
          capacity: data.capacity ?? 0,
          rate: Number(data.rate ?? 0),
          is_active: Boolean(Number(data.is_active)),
          slug: data.slug ?? "",
          category_ids: (data.categories || []).map((item: any) => item.id),
          main_image: data.main_image ?? null,
          images: data.images ?? [],
        });
        setIsLoaded(true);
      });
    }
  }, [isUpdateMode, id]);

  const toggleCategory = (categoryId: number) => {
    setForm((prev) => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter((item) => item !== categoryId)
        : [...prev.category_ids, categoryId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.en_title) {
      ToastrNotification.error("عنوان فارسی و انگلیسی الزامی است");
      return;
    }
    if (!form.teacher_id) {
      ToastrNotification.error("استاد را انتخاب کنید");
      return;
    }
    if (!isUpdateMode && !mainImageFile) {
      ToastrNotification.error("تصویر اصلی دوره الزامی است");
      return;
    }
    setIsSubmitting(true);
    try {
      const hasFiles = Boolean(mainImageFile || galleryFiles.length || fileUploads.length);
      const payload: Record<string, any> = {
        title: form.title,
        en_title: form.en_title,
        status: form.status,
        description: form.description,
        teacher_id: form.teacher_id,
        duration: form.duration,
        meta_title: form.meta_title,
        meta_description: form.meta_description,
        unit_price: form.unit_price,
        discount: form.discount,
        discount_type: form.discount_type,
        capacity: form.capacity,
        rate: form.rate,
        is_active: form.is_active ? 1 : 0,
        slug: form.slug,
      };
      if (hasFiles) payload["category_ids[]"] = form.category_ids;
      else payload.category_ids = form.category_ids;
      if (mainImageFile) payload.main_image = mainImageFile;
      if (galleryFiles.length) payload[hasFiles ? "images[]" : "images"] = galleryFiles;
      if (fileUploads.length) payload[hasFiles ? "files[]" : "files"] = fileUploads;

      const response = await submitAdminResource(
        isUpdateMode ? "api/admin/courses/" + id : "api/admin/courses",
        isUpdateMode,
        payload,
        hasFiles
      );
      if (response.success) navigate(ROUTES.courseIndex);
      else ToastrNotification.error(response.message || "خطا در ذخیره دوره");
    } catch (error) {
      console.log("error in CourseCreateEdit", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentImageUrl = useMemo(
    () => (mainImageFile ? URL.createObjectURL(mainImageFile) : mediaUrl(form.main_image)),
    [mainImageFile, form.main_image]
  );

  return (
    <div>
      <PageMeta title={isUpdateMode ? "ویرایش دوره" : "ایجاد دوره"} />
      <PageBreadcrumb pageTitle={isUpdateMode ? "ویرایش دوره" : "ایجاد دوره"} />
      <ComponentCard title="اطلاعات دوره">
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
            <Label>استاد</Label>
            <SearchableDropDownList
              key={`teacher-${form.teacher_id}`}
              apiUrl="api/admin/teachers"
              searchParamName="name"
              dataPath="data.teachers.data"
              valueKey="id"
              labelKey="name"
              placeholder="جستجوی استاد"
              minSearchLength={2}
              defaultValue={form.teacher_id ? { value: form.teacher_id, label: form.teacher_name || String(form.teacher_id) } : null}
              onChange={(option) => setForm({ ...form, teacher_id: option?.value ?? "", teacher_name: option?.label ?? "" })}
            />
          </div>
          {isUpdateMode && (
            <div>
              <Label>وضعیت انتشار</Label>
              <select className={selectClassName} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">پیش‌نویس</option>
                <option value="published">منتشر شده</option>
                <option value="archived">آرشیو</option>
              </select>
            </div>
          )}
          <div>
            <Label>مدت (دقیقه)</Label>
            <Input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>قیمت</Label>
            <Input type="text" numberFormat value={form.unit_price} onChange={(e) => setForm({ ...form, unit_price: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>تخفیف</Label>
            <Input type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>نوع تخفیف</Label>
            <select className={selectClassName} value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })}>
              <option value="flat">مبلغی</option>
              <option value="percentage">درصدی</option>
            </select>
          </div>
          <div>
            <Label>ظرفیت</Label>
            <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>امتیاز</Label>
            <Input type="number" step={0.1} value={form.rate} onChange={(e) => setForm({ ...form, rate: parseFloat(e.target.value) || 0 })} />
          </div>
          <div>
            <Label>اسلاگ</Label>
            <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>توضیحات</Label>
            <TextArea rows={5} value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          </div>
          <div>
            <Label>متا عنوان</Label>
            <Input value={form.meta_title} onChange={(e) => setForm({ ...form, meta_title: e.target.value })} />
          </div>
          <div>
            <Label>متا توضیحات</Label>
            <Input value={form.meta_description} onChange={(e) => setForm({ ...form, meta_description: e.target.value })} />
          </div>
          <div className="md:col-span-2">
            <Label>دسته‌بندی‌ها</Label>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
              {categories.map((item) => (
                <Checkbox key={item.id} label={item.title} checked={form.category_ids.includes(item.id)} onChange={() => toggleCategory(item.id)} />
              ))}
            </div>
          </div>
          <div>
            <Label>{isUpdateMode ? "تصویر اصلی (اختیاری)" : "تصویر اصلی"}</Label>
            {currentImageUrl && <img src={currentImageUrl} alt="" className="mb-3 h-20 w-20 rounded-lg object-cover" />}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" onChange={(e) => setMainImageFile(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <Label>گالری تصاویر</Label>
            {form.images.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {form.images.map((img, index) => (
                  <img key={img.id ?? index} src={mediaUrl(img)} alt="" className="h-16 w-16 rounded-lg object-cover" />
                ))}
              </div>
            )}
            <FileInput accept="image/jpeg,image/png,image/jpg,image/webp" multiple onChange={(e) => setGalleryFiles(e.target.files ? Array.from(e.target.files) : [])} />
          </div>
          <div>
            <Label>فایل‌ها</Label>
            <FileInput multiple onChange={(e) => setFileUploads(e.target.files ? Array.from(e.target.files) : [])} />
            <p className="mt-1 text-xs text-gray-400">pdf، doc، zip و مشابه</p>
          </div>
          {isLoaded && (
            <div>
              <Label>وضعیت فعال</Label>
              <div className="mt-2">
                <Switch
                  key={`is_active-${form.is_active}`}
                  label="دوره فعال است"
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
