# Neumorphism: тіні і як не зламати читабельність

Слово: **ТІНЬ** · матеріал: https://devguide.com.ua/materials/insta-neumorphism

М'які «втиснуті» кнопки — це дві тіні на однаковому з фоном кольорі:

```css
.soft {
  background: #e6e7ee;
  border-radius: 16px;
  box-shadow: 8px 8px 16px #c5c6cc, -8px -8px 16px #ffffff;
}
.soft:active {
  box-shadow: inset 8px 8px 16px #c5c6cc, inset -8px -8px 16px #ffffff;
}
```

**Проблема:** кнопку погано видно — у неї майже немає контрасту з фоном. **Як виправити:** тонке обведення, колір лише на головній дії, темніший текст.

---

Більше покроково — у [шляхах навчання DevGuide](https://devguide.com.ua/learning).
