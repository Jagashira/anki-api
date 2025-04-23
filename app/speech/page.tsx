"use client";
import Head from "next/head";
import { useState, useEffect } from "react";
import { Button, Container, Center, Text, Loader, Alert } from "@mantine/core";
import AudioRecorder from "./../components/Record"; // 新しい自作モジュール

import { IconRobot, IconAlertCircle, IconRefresh } from "@tabler/icons-react";

interface MessageSchema {
  role: "assistant" | "user" | "system";
  content: string;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesArray, setMessagesArray] = useState<MessageSchema[]>([
    {
      role: "system",
      content:
        "You are an AI assistant helping create meeting minutes using ChatGPT and Whisper API.",
    },
  ]);

  useEffect(() => {
    if (
      messagesArray.length > 1 &&
      messagesArray[messagesArray.length - 1].role !== "system"
    ) {
      gptRequest();
    }
  }, [messagesArray]);

  const gptRequest = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/chatgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messagesArray }),
      });

      const gptResponse = await response.json();
      setLoading(false);
      if (gptResponse.content) {
        setMessagesArray((prevState) => [...prevState, gptResponse]);
      } else {
        setError("No response returned from GPT.");
      }
    } catch (error) {
      setLoading(false);
      setError("Failed to communicate with GPT.");
    }
  };

  const updateMessagesArray = (newMessage: string) => {
    const newMessageSchema: MessageSchema = {
      role: "user",
      content: newMessage,
    };
    setMessagesArray((prevState) => [...prevState, newMessageSchema]);
  };

  const whisperRequest = async (audioBlob: Blob) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.wav");
    try {
      const response = await fetch("/api/whisper", {
        method: "POST",
        body: formData,
      });
      const { text, error } = await response.json();
      if (response.ok) {
        updateMessagesArray(text);
      } else {
        setLoading(false);
        setError(error.message);
      }
    } catch (error) {
      setLoading(false);
      setError("Error processing audio.");
    }
  };

  return (
    <>
      <Head>
        <title>Real-time Meeting Minutes with ChatGPT + Whisper</title>
      </Head>
      <Container size="sm" mt={25}>
        <Center>
          <IconRobot size={30} color="teal" />
          <Text
            //@ts-ignore
            size={30}
            weight={300}
            variant="gradient"
            gradient={{ from: "blue", to: "teal" }}
          >
            Meeting Minutes Bot
          </Text>
        </Center>

        {error && (
          <Alert icon={<IconAlertCircle />} title="Error!" color="red">
            {error}
          </Alert>
        )}

        <div>
          {messagesArray.length > 1 &&
            messagesArray.map((message, index) => (
              <div key={index}>
                <Text>
                  {message.role === "user" ? "User: " : "Assistant: "}{" "}
                  {message.content}
                </Text>
              </div>
            ))}
        </div>

        <Center mt={40}>
          {!loading ? (
            <AudioRecorder onComplete={(blob) => whisperRequest(blob)} />
          ) : (
            <Loader />
          )}

          {!loading && (
            <Button
              variant="light"
              color="red"
              radius="lg"
              leftSection={<IconRefresh />}
              ml="md"
              onClick={() =>
                setMessagesArray([
                  {
                    role: "system",
                    content:
                      "You are an AI assistant helping create meeting minutes using ChatGPT and Whisper API.",
                  },
                ])
              }
            >
              Reset
            </Button>
          )}
        </Center>

        {!loading && (
          <Button
            variant="gradient"
            radius={100}
            w={40}
            m={20}
            p={0}
            onClick={() =>
              setMessagesArray([
                {
                  role: "system",
                  content:
                    "You are an AI assistant helping create meeting minutes using ChatGPT and Whisper API.",
                },
              ])
            }
          >
            <IconRefresh size={25} />
          </Button>
        )}
      </Container>
    </>
  );
}
