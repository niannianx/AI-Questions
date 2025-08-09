import React, { useEffect, useCallback } from 'react';
import { message, Skeleton } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuestionList } from '../hooks/useQuestionList';
import { useSelectableList } from '../hooks/useSelectableList';
import { useModal } from '../hooks/useModal';
import questionService, { Question } from '../service/question';
import QuestionFilterBar from '../components/QuestionFilterBar';
import QuestionTable from '../components/QuestionTable';
import QuestionEditorModal from '../components/QuestionEditorModal';

const QuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    questions,
    total,
    loading,
    queryParams,
    fetchQuestions,
    handleSearch,
    handleTypeFilter,
    handlePageChange,
  } = useQuestionList();

  const {
    selected: selectedRowKeys,
    // toggle: toggleSelection,
    setSelected: setSelectedRowKeys,
    clear: clearSelection,
  } = useSelectableList<React.Key>();

  const editorModal = useModal<Question>();
  const selectedIds = selectedRowKeys.map((key) => Number(key));

  useEffect(() => {
    fetchQuestions();
  }, [queryParams, fetchQuestions, location.pathname]);

  const handleAddQuestion = useCallback(
    (type: 'ai' | 'manual') => {
      if (type === 'ai') {
        navigate('/questions/ai-generation');
      } else {
        editorModal.open();
      }
    },
    [navigate, editorModal]
  );

  const handleDelete = useCallback(
    async (ids: number[]) => {
      try {
        await questionService.delete(ids);
        message.success('删除成功');
        clearSelection();
        fetchQuestions();
      } catch {
        message.error('删除失败');
      }
    },
    [fetchQuestions, clearSelection]
  );

  const handleEdit = useCallback(
    (record: Question) => {
      editorModal.open(record);
    },
    [editorModal]
  );

  const handleSaveQuestion = useCallback(
    async (values: Partial<Question>) => {
      try {
        if (editorModal.data?.id) {
          await questionService.update(editorModal.data.id, values as Question);
          message.success('更新成功');
        } else {
          await questionService.create(values as Question);
          message.success('创建成功');
        }
        editorModal.close();
        fetchQuestions();
      } catch {
        message.error('保存失败');
      }
    },
    [editorModal, fetchQuestions]
  );

  return (
    <div className="p-6">
      <Outlet />
      {!window.location.pathname.includes('ai-generation') && (
        <>
          <QuestionFilterBar
            onSearch={handleSearch}
            onTypeFilter={handleTypeFilter}
            onAddQuestion={handleAddQuestion}
            selectedCount={selectedRowKeys.length}
            // onDeleteSelected={() => handleDelete(selectedRowKeys)}
            onDeleteSelected={() => handleDelete(selectedIds)}
            currentType={queryParams.type}
          />

          {!loading ? (
            <QuestionTable
              questions={questions}
              total={total}
              loading={loading}
              queryParams={queryParams}
              onPageChange={handlePageChange}
              selectedRowKeys={selectedRowKeys}
              // onSelectChange={(selectedKeys) => {

              //   selectedKeys.forEach(key => toggleSelection(key as number));
              // }}
              onSelectChange={setSelectedRowKeys}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Skeleton
              active
              loading={loading}
              paragraph={{ rows: queryParams.pageSize }}
            />
          )}

          <QuestionEditorModal
            visible={editorModal.visible}
            onCancel={editorModal.close}
            onSave={handleSaveQuestion}
            initialValues={editorModal.data}
          />
        </>
      )}
    </div>
  );
};

export default QuestionBank;
