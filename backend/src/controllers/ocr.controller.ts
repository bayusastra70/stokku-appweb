import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { openai } from "../config/ai";
import { env } from "../config/env";

export const processImage = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "Tidak ada gambar yang diupload" });
      return;
    }

    const imagePath = req.file.path;
    const modelId = env.MODEL_ID || "nvidia/llama-3.1-nemotron-nano-vl-8b-v1";

    // Read file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    const completion = await openai.chat.completions.create({
      model: modelId,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: dataUrl,
              },
            },
            {
              type: "text",
              text: `Analisis gambar ini (struk belanja atau foto produk) dan ekstrak semua item produk yang ada.
              Kembalikan output **HANYA** berupa JSON valid dengan struktur berikut:
              {
                "products": [
                  {
                    "product_name": "Nama produk lengkap",
                    "price": 0, (angka, harga satuan)
                    "quantity": 1, (angka)
                    "category": "Kategori prediksi (Makanan/Minuman/Elektronik/dll)",
                    "supplier": "Nama Toko/Supplier dari kop surat (jika ada)",
                    "expiry_date": "YYYY-MM-DD" (jika ada, null jika tidak)
                  }
                ]
              }
              
              Aturan:
              1. Pastikan price adalah number (bersihkan 'Rp' atau titik).
              2. Jika nama toko ada di atas, gunakan sebagai 'supplier' untuk semua item.
              3. Jangan gunakan markdown code block.`,
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
      stream: false,
    });

    // Cleanup file
    fs.unlinkSync(imagePath);

    const content = completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Gagal mendapatkan respon dari AI");
    }

    // Clean up potential markdown formatting
    const jsonStr = content.replace(/```json\n?|\n?```/g, "").trim();

    try {
      const data = JSON.parse(jsonStr);
      res.json({ success: true, data });
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw content:", content);
      res.status(500).json({
        error: "Gagal memproses respon AI",
        raw_response: content,
      });
    }
  } catch (error) {
    // Ensure file cleanup on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
