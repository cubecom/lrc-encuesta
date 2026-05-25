/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Star, CheckCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  createSurveyResponse,
  getAdvisors,
  getSurveyById,
} from "../lib/supabase/survey.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useParams } from "react-router-dom";

const validateRUC = (ruc: string): boolean => {
  if (!/^\d{11}$/.test(ruc)) return false;

  const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];

  const sum = factors.reduce(
    (acc, factor, index) => acc + Number(ruc[index]) * factor,
    0,
  );

  const remainder = 11 - (sum % 11);
  const checkDigit = remainder === 10 ? 0 : remainder === 11 ? 1 : remainder;

  return checkDigit === Number(ruc[10]);
};

const SurveyPage = () => {
  const { id } = useParams();
  const [survey, setSurvey] = useState<any>(null);
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedAdvisorId, setSelectedAdvisorId] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        const [surveyData, advisorsData] = await Promise.all([
          getSurveyById(id),
          getAdvisors(),
        ]);

        setSurvey(surveyData);
        setAdvisors(advisorsData || []);
      } catch (error) {
        console.error(error);
        toast.error("Error cargando encuesta");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleAnswer = useCallback((questionId: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));

    setErrors((prev) => {
      if (!prev[questionId]) return prev;

      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  }, []);

  const validate = useCallback(() => {
    if (!survey) return false;

    const newErrors: Record<string, string> = {};

    for (const q of survey.questions) {
      const value = answers[q.id];

      if (q.required && !value) {
        newErrors[q.id] = "Campo obligatorio";
        continue;
      }

      if (q.validation === "ruc" && value && !validateRUC(value)) {
        newErrors[q.id] = "RUC inválido";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [survey, answers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAdvisorId) {
      toast.error("Selecciona un ejecutivo");
      return;
    }

    if (!validate()) {
      toast.error("Completa los campos requeridos");
      return;
    }

    try {
      setSubmitting(true);

      await createSurveyResponse({
        form_id: survey.id,
        advisor_id: selectedAdvisorId,
        answers,
      });

      setSubmitted(true);
    } catch (error) {
      console.error(error);
      toast.error("Error enviando encuesta");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAdvisor = useMemo(
    () => advisors.find((a) => a.id === selectedAdvisorId),
    [advisors, selectedAdvisorId],
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-10 h-10" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No hay encuesta activa
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-card max-w-md w-full rounded-2xl shadow-lg p-8 text-center space-y-6 border border-border"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mx-auto w-16 h-16 bg-[#305289]/10 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-[#286ddc]" />
          </motion.div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">
              ¡Gracias por tu opinión!
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Tu feedback es muy valioso para nosotros. Nos ayuda a mejorar
              continuamente nuestro servicio y la atención que brindamos.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#305289]/10 mb-2">
            <Star className="w-6 h-6 text-[#286ddc]" />
          </div>
          <h1 className="text-4xl font-bold text-[#286ddc] tracking-tight">
            {survey.title}
          </h1>
          <p className="text-muted-foreground text-lg">
            Tu opinión es fundamental para que sigamos mejorando. Cuéntanos cómo
            fue tu experiencia con nuestro Ejecutivo(a) Comercial.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-6 rounded-2xl shadow-sm border border-border space-y-5"
          >
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-foreground">
                Selecciona a tu Ejecutivo(a)
              </label>
              <p className="text-xs text-muted-foreground">
                Elige a la persona que te atendió
              </p>
            </div>

            <Select
              value={selectedAdvisorId}
              onValueChange={setSelectedAdvisorId}
            >
              <SelectTrigger className="w-full h-12 rounded-xl bg-[#f2f2f2] border-border hover:border-[#305289] focus:border-[#305289]/50 focus:ring-[#305289]/50 focus:ring-offset-0 transition-colors">
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>

              <SelectContent className="max-h-72 overflow-y-auto">
                {advisors?.map((user) => (
                  <SelectItem
                    key={user.id}
                    value={user.id}
                    className="cursor-pointer focus:bg-[#305289] focus:text-white"
                  >
                    <div className="flex items-center gap-3">
                      {user.url_logo_signed ? (
                        <img
                          src={user.url_logo_signed}
                          alt={user.contact_name}
                          className="w-8 h-8 rounded-full object-cover bg-cover bg-center"
                        />
                      ) : (
                        <img
                          src="/img/lrc.avif"
                          alt={user.contact_name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      <span>{user.contact_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedAdvisor && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 bg-[#dde5f266] p-4 rounded-xl border border-secondary/50"
              >
                <div className="relative w-30 h-30 rounded-full overflow-hidden border-2 border-card shadow-sm shrink-0">
                  {selectedAdvisor.url_logo_signed ? (
                    <img
                      src={selectedAdvisor.url_logo_signed}
                      alt={selectedAdvisor.contact_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src="/img/lrc.avif"
                      alt={selectedAdvisor.contact_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    Ejecutivo(a) Seleccionado
                  </p>
                  <h3 className="text-base font-semibold text-foreground truncate">
                    {selectedAdvisor.contact_name}
                  </h3>
                </div>
                <div className="text-[#305289]">
                  <User className="w-5 h-5" />
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="bg-white p-6 rounded-2xl border space-y-8">
            {survey.questions.map((question: any, idx: number) => {
              const hasError = !!errors[question.id];
              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.05 }}
                  className={`space-y-3 p-5 rounded-2xl border transition-all duration-200 ${
                    hasError
                      ? "border-red-300 bg-red-50/40 shadow-[0_2px_8px_-2px_rgba(239,68,68,0.15)]"
                      : "border-border bg-card"
                  }`}
                >
                  <label className="block text-sm font-medium text-foreground">
                    <span className="text-[#305289] font-semibold">
                      {idx + 1}.
                    </span>{" "}
                    {question.label}
                    {question.required && (
                      <span className="text-[#ef4444] ml-1">*</span>
                    )}
                  </label>

                  <div className="pl-4">
                    {question.type === "rating" && (
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <motion.button
                            key={star}
                            type="button"
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleAnswer(question.id, star)}
                            className="focus:outline-none transition-all cursor-pointer"
                          >
                            <Star
                              className={`w-8 h-8 transition-all ${
                                (answers[question.id] || 0) >= star
                                  ? "fill-yellow-500 text-yellow-500 drop-shadow-sm"
                                  : "text-muted hover:text-yellow-500/50"
                              }`}
                            />
                          </motion.button>
                        ))}
                        {answers[question.id] && (
                          <span className="text-xs font-medium text-muted-foreground ml-2">
                            {answers[question.id]}/5
                          </span>
                        )}
                      </div>
                    )}

                    {question.type === "textarea" && (
                      <textarea
                        rows={4}
                        className="w-full bg-[#f2f2f2] border border-[#f2f2f2] text-foreground rounded-xl focus:ring-2 focus:ring-[#305289] focus:border-[#305289] block p-4 transition-all placeholder:text-muted-foreground resize-none"
                        placeholder="Escribe tu respuesta..."
                        value={answers[question.id] || ""}
                        onChange={(e) =>
                          handleAnswer(question.id, e.target.value)
                        }
                      />
                    )}

                    {question.type === "text" && (
                      <input
                        type="text"
                        className="w-full h-12 bg-[#f2f2f2] border border-[#f2f2f2] text-foreground rounded-xl focus:ring-2 focus:ring-[#305289] focus:border-[#305289] block px-4 transition-all placeholder:text-muted-foreground"
                        placeholder="Escribe tu respuesta..."
                        maxLength={
                          question.validation === "ruc"
                            ? 11
                            : undefined
                        }
                        inputMode={
                          question.validation === "ruc"
                            ? "numeric"
                            : "text"
                        }
                        value={answers[question.id] || ""}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (question.validation === "ruc") {
                            value = value.replace(/\D/g, "").slice(0, 11);
                          }

                          handleAnswer(question.id, value);
                        }}
                      />
                    )}

                    {question.type === "select" && (
                      <Select
                        value={answers[question.id] || ""}
                        onValueChange={(value) =>
                          handleAnswer(question.id, value)
                        }
                      >
                        <SelectTrigger className="w-full h-12 rounded-xl bg-[#f2f2f2] border-border hover:border-[#305289] focus:border-[#305289]/50 focus:ring-[#305289]/50 focus:ring-offset-0 transition-colors">
                          <SelectValue placeholder="Selecciona una opción..." />
                        </SelectTrigger>
                        <SelectContent>
                          {question.options?.map((option: string) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {hasError && (
                    <p className="text-[#ef4444] text-xs pl-4 mt-1 font-medium flex items-center gap-1">
                      {errors[question.id]}
                    </p>
                  )}
                </motion.div>
              );
            })}

            <div className="h-px bg-border" />

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xs text-muted-foreground text-center italic"
            >
              ✨ Gracias por ayudarnos a brindar un mejor servicio
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="w-full cursor-pointer flex items-center justify-center py-4 px-4 rounded-xl shadow-sm text-base font-medium text-white bg-[#286ddc] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#305289]/50 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                  Enviando tu evaluación...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5 mr-2" />
                  Enviar Calificación
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SurveyPage;
