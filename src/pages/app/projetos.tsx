import { zodResolver } from "@hookform/resolvers/zod";
import { SelectValue } from "@radix-ui/react-select";
import { format } from "date-fns";
import { Helmet } from "react-helmet-async";
import { Controller, useForm } from "react-hook-form";

import { getProjetosExcel } from "@/api/get-projetos-excel";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

import { ProjetosForm, projetosForm } from "./projetos.validacao";
import { useEffect, useState } from "react";
import { api } from "@/lib/axios";
import { toast } from 'react-toastify';
import ClipLoader from "react-spinners/ClipLoader";

function Spinner() {
  return <ClipLoader color="#36d7b7" />;
}

export function Projetos() {
  const [municipios, setMunicipios] = useState([]);
  const [especiesProjetos, setEspeciesProjetos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [municipiosResponse, especiesProjetosResponse] = await Promise.all([
          api.get('municipios', { headers: { 'Accept': 'application/json' } }),
          api.get('projeto/especies', { headers: { 'Accept': 'application/json' } }),
        ]);
        setMunicipios(municipiosResponse.data);
        setEspeciesProjetos(especiesProjetosResponse.data);
      } catch (error) {
        toast.error("Erro ao buscar dados");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isValid },
  } = useForm<ProjetosForm>({
    resolver: zodResolver(projetosForm),
    defaultValues: {
      especie: "0",
      municipioId: 9,
      dataInicio: new Date(),
      dataFim: new Date(),
    },
  });

  const handleGerarExcel = async ({
    municipioId,
    especie,
    dataInicio,
    dataFim,
  }: ProjetosForm) => {
    try {
      await getProjetosExcel({
        municipioId,
        especie,
        dataInicio: format(dataInicio, "yyyy-MM-dd"),
        dataFim: format(dataFim, "yyyy-MM-dd"),
      });
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner /> { }
      </div>
    );
  }

  return (
    <>
      <Helmet title="Projetos" />

      <form className="space-y-4" onSubmit={handleSubmit(handleGerarExcel)}>
        <Controller
          name="municipioId"
          control={control}
          render={({ field: { name, onChange, value } }) => (
            <div className="space-y-2">
              <Label htmlFor="municipio">Município</Label>
              <Select
                name={name}
                onValueChange={(val) => onChange(Number(val))}
                value={String(value)}
              >
                <SelectTrigger className="h-8 w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {municipios.map((municipio: any) => (
                    <SelectItem
                      key={municipio.id}
                      value={String(municipio.id)}
                    >
                      {municipio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <Controller
          name="especie"
          control={control}
          render={({ field: { name, onChange, value } }) => {
            return (
              <div className="space-y-2">
                <Label htmlFor="especie">Espécie</Label>
                <Select name={name} onValueChange={onChange} value={value}>
                  <SelectTrigger className="h-8 w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {especiesProjetos.map((especie: any) => (
                      <SelectItem
                        key={especie.id}
                        value={String(especie.id)}
                      >
                        {especie.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }}
        />
        <div className="space-y-2">
          <Label htmlFor="periodo">Período</Label>
          <div className="flex flex-row gap-2">
            <Controller
              name="dataInicio"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <DatePicker
                  name={name}
                  placeholder="Data inicio"
                  date={value}
                  onDateChange={onChange}
                />
              )}
            />
            <Controller
              name="dataFim"
              control={control}
              render={({ field: { name, onChange, value } }) => (
                <DatePicker
                  name={name}
                  placeholder="Data fim"
                  date={value}
                  onDateChange={onChange}
                />
              )}
            />
          </div>
        </div>

        <Button size="lg" type="submit" disabled={isSubmitting || !isValid}>
          Gerar excel
        </Button>
      </form>
    </>
  );
}
