using System.Threading.Tasks;

namespace BreakingNewGround.Server.Models
{
    public interface IGenericCrudService<T>
        where T : class
    {
        Task<T> CreateAsync(T model);

        Task<T> GetByIdAsync(long id);

        Task<T[]> GetAllAsync();

        Task<T> UpdateAsync(T model);

        Task<bool> DeleteAsync(long id);
    }
}