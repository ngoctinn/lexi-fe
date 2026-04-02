import * as React from "react";
import { getFlashcardsAction } from "../../actions/flashcards";
import { columns } from "./columns";
import { VocabularyDataTable } from "./data-table";

export async function FlashcardList() {
  const data = await getFlashcardsAction();

  return (
    <div className="w-full">
      <VocabularyDataTable columns={columns} data={data} />
    </div>
  );
}
