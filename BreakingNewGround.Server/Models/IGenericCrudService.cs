using System.Threading;
using System.Threading.Tasks;

namespace BreakingNewGround.Server.Models
{
    public interface IGenericCrudService<T>
        where T : class
    {
        Task<T> CreateAsync(T model, CancellationToken cancellationToken);

        Task<T> GetByIdAsync(long id, string[] includes, CancellationToken cancellationToken);

        Task<PagedResult<T>> GetAllAsync(GetRequest request, string[] includes, CancellationToken cancellationToken);

        Task<T> UpdateAsync(T model, CancellationToken cancellationToken);

        Task<bool> DeleteAsync(long id, CancellationToken cancellationToken);
    }
}