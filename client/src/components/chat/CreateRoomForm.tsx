import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// 유효성 검사 스키마
const formSchema = z.object({
  name: z.string().min(2, '채팅방 이름은 최소 2글자 이상이어야 합니다.').max(50, '채팅방 이름은 최대 50글자까지 가능합니다.'),
  description: z.string().max(200, '설명은 최대 200글자까지 가능합니다.').optional(),
});

interface CreateRoomFormProps {
  onSubmit: (data: { name: string; description: string }) => void;
  isLoading: boolean;
}

const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSubmit, isLoading }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      name: values.name,
      description: values.description || '',
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>채팅방 이름</FormLabel>
              <FormControl>
                <Input placeholder="새 채팅방 이름" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>설명 (선택사항)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="채팅방에 대한 설명을 입력하세요" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? '생성 중...' : '채팅방 만들기'}
        </Button>
      </form>
    </Form>
  );
};

export default CreateRoomForm; 