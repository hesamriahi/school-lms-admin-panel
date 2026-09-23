// shared-dd-tree-data.ts

export interface ProductCategoryNode {
    id: string;
    text: string;
    items?: ProductCategoryNode[]; // فرزندها (چند سطحی)
  }
  
  // دیتای تستی دسته‌بندی محصولات
  export const data: ProductCategoryNode[] = [
    {
      id: 'electronics',
      text: 'الکترونیک',
      items: [
        {
          id: 'electronics-phones',
          text: 'موبایل و گوشی',
          items: [
            {
              id: 'electronics-phones-smartphones',
              text: 'گوشی هوشمند'
            },
            {
              id: 'electronics-phones-feature',
              text: 'Feature Phone'
            }
          ]
        },
        {
          id: 'electronics-laptops',
          text: 'لپ‌تاپ',
          items: [
            {
              id: 'electronics-laptops-gaming',
              text: 'لپ‌تاپ گیمینگ'
            },
            {
              id: 'electronics-laptops-ultrabook',
              text: 'اولترابوک'
            }
          ]
        },
        {
          id: 'electronics-tv',
          text: 'تلویزیون و صوتی تصویری',
          items: [
            {
              id: 'electronics-tv-led',
              text: 'تلویزیون LED'
            },
            {
              id: 'electronics-tv-smart',
              text: 'تلویزیون هوشمند'
            }
          ]
        }
      ]
    },
    {
      id: 'home-kitchen',
      text: 'خانه و آشپزخانه',
      items: [
        {
          id: 'home-furniture',
          text: 'مبلمان',
          items: [
            {
              id: 'home-furniture-livingroom',
              text: 'مبل پذیرایی'
            },
            {
              id: 'home-furniture-bedroom',
              text: 'سرویس خواب'
            }
          ]
        },
        {
          id: 'home-appliances',
          text: 'لوازم خانگی برقی',
          items: [
            {
              id: 'home-appliances-fridge',
              text: 'یخچال'
            },
            {
              id: 'home-appliances-washer',
              text: 'ماشین لباسشویی'
            }
          ]
        }
      ]
    },
    {
      id: 'fashion',
      text: 'مد و پوشاک',
      items: [
        {
          id: 'fashion-men',
          text: 'مردانه',
          items: [
            {
              id: 'fashion-men-shoes',
              text: 'کفش مردانه'
            },
            {
              id: 'fashion-men-clothes',
              text: 'لباس مردانه'
            }
          ]
        },
        {
          id: 'fashion-women',
          text: 'زنانه',
          items: [
            {
              id: 'fashion-women-dress',
              text: 'پیراهن و لباس زنانه'
            },
            {
              id: 'fashion-women-bags',
              text: 'کیف زنانه'
            }
          ]
        }
      ]
    }
  ];
  