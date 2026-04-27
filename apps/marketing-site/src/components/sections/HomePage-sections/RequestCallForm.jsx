import { useRef, useState } from "react";
import Section from "../../layout/Section";
import { H2 } from "../../UI/Heading";
import Input from "../../atoms/Input";
import Textarea from "../../atoms/Textarea";
import Button from "../../atoms/Button";
import { portal } from "../../../lib/portal";
import { getRecaptchaToken } from "../../../lib/recaptcha";
import supportTeamImg from "../../../assets/Smiling Businesswoman with Tablet _ Premium…-Photoroom.png";

export default function RequestCallForm() {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    description: ''
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }

    if (files.length === 0) return;

    setIsProcessingImages(true);

    // Convert images to base64 with proper async handling
    const processFiles = async () => {
      const newImages = [];
      const newPreviews = [];
      
      for (const file of files) {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" is too large. Each image must be less than 5MB`);
          continue;
        }

        try {
          const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(reader.error);
            reader.readAsDataURL(file);
          });
          
          newImages.push(base64);
          newPreviews.push(base64);
        } catch (error) {
          console.error('Error processing image:', error);
          alert(`Error processing image "${file.name}". Please try again.`);
        }
      }

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages]);
        setImagePreviews(prev => [...prev, ...newPreviews]);
      }
      
      setIsProcessingImages(false);
    };

    processFiles();
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Validate form data
      if (!formData.fullName.trim() || !formData.phone.trim() || !formData.description.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Prepare submit data with proper image handling
      const submitData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        description: formData.description.trim(),
        images: images || [] // Ensure images is always an array
      };

      const recaptchaToken = await getRecaptchaToken('submit_job_request');
      await portal.submitJobRequest({
        ...submitData,
        recaptchaToken,
      });

        setSubmitStatus('success');
        setFormData({
          fullName: '',
          phone: '',
          email: '',
          description: ''
        });
        setImages([]);
        setImagePreviews([]);
        
        // Reset the file input
        if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-brand-lightblue/10">
      {/* Top curved divider */}
      <div className="absolute top-0 left-0 right-0 -translate-y-full">
        <svg
          viewBox="0 0 1440 150"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[80px] fill-brand-lightblue/10"
          preserveAspectRatio="none"
        >
          <path d="M0,150 C480,0 960,300 1440,150 L1440,0 L0,0 Z"></path>
        </svg>
      </div>

      <Section className="relative z-10">
        <div className="container-app grid md:grid-cols-2 gap-10 items-center">
          {/* Left: form card */}
          <div className="rounded-[32px] border border-slate-200/60 bg-white p-6 md:p-8 transition">
            <H2 className="text-center md:text-left">Request a Call</H2>
            <p className="text-center md:text-left muted mt-1">
              We’ll get back to you within business hours — usually faster.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
              <Input 
                label="Full name" 
                name="fullName"
                placeholder="Your name" 
                value={formData.fullName}
                onChange={handleInputChange}
                required 
              />
              <Input
                label="Phone"
                name="phone"
                placeholder="e.g., 04xx xxx xxx"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <Input
                label="Email (optional)"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleInputChange}
              />
              <Textarea
                label="How can we help?"
                name="description"
                rows={4}
                placeholder="Briefly describe the issue"
                value={formData.description}
                onChange={handleInputChange}
                required
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Images (Optional - up to 5 images, max 5MB each)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  disabled={isProcessingImages}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-semibold
                    file:bg-brand-navy file:text-white
                    hover:file:bg-brand-blue
                    cursor-pointer disabled:opacity-50"
                />
                
                {isProcessingImages && (
                  <p className="mt-1 text-sm text-brand-blue">
                    Processing images... Please wait.
                  </p>
                )}
                
                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-24 w-full rounded-2xl border-2 border-gray-200 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-xl bg-red-500 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submitStatus === 'success' && (
                <div className="rounded-2xl border border-brand-green/45 bg-brand-green/15 px-4 py-3 text-brand-navy" role="status" aria-live="polite">
                  Thank you! We'll get back to you within business hours.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-red-700" role="alert">
                  Sorry, there was an error submitting your request. Please try again.
                </div>
              )}

                      <div className="flex justify-center md:justify-start">
                        <Button 
                          type="submit" 
                          className="min-h-11 min-w-40"
                          disabled={isSubmitting || isProcessingImages}
                        >
                          {isSubmitting ? 'Submitting...' : 
                           isProcessingImages ? 'Processing Images...' : 
                           'Request a Call'}
                        </Button>
                      </div>

              <p className="text-xs text-slate-500 text-center md:text-left mt-2">
                No fix, no fee · Same-day service available
              </p>
            </form>
          </div>

          {/* Right: visual */}
          <div className="aspect-video flex items-center justify-center p-6 bg-transparent">
  <img
    src={supportTeamImg}
    alt="Support team"
    className="max-h-max w-auto object-contain drop-shadow-xl"
    style={{ maxWidth: "100%" }}
  />
</div>

        </div>
      </Section>

      {/* Bottom curved divider */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-full rotate-180">
        <svg
          viewBox="0 0 1440 150"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-[80px] fill-brand-lightblue/10"
          preserveAspectRatio="none"
        >
          <path d="M0,150 C480,0 960,300 1440,150 L1440,0 L0,0 Z"></path>
        </svg>
      </div>
    </section>
  );
}
